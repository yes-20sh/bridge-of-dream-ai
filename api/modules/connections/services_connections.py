from uuid import UUID
from math import ceil
import urllib.parse
import httpx
import os
import re
from bs4 import BeautifulSoup
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from core.supabase import get_db
from shared.pagination.pagination_schema import PaginationParams, PaginatedResponse
from shared.pagination.pagination_service import paginate_query
from shared.database.model_connection import ConnectionModel
from .schema_connections import ConnectionDto, ConnectionCreate

class ConnectionsService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def get_connections(self, linkedin_url: str, company: str | None, params: PaginationParams) -> PaginatedResponse[ConnectionDto]:
        try:
            normalized_company = company.strip() if company else ""

            # 1. Scrape connections from LinkedIn search results page (authenticated via li_at cookie)
            connections_data = self._scrape_connections(normalized_company)

            # 2. Paginate in-memory
            total = len(connections_data)
            total_pages = ceil(total / params.limit) if params.limit > 0 else 0
            
            offset = (params.page - 1) * params.limit
            paginated_items = connections_data[offset : offset + params.limit]

            # 3. Map to ConnectionDto
            data_dtos = [
                ConnectionDto(
                    id=conn["id"],
                    name=conn["name"],
                    profile=conn["profile"],
                    job=conn["job"],
                    company=conn["company"],
                    location=conn["location"],
                    email=conn["email"],
                    number=conn["number"],
                    lprofile=conn["lprofile"],
                    linkedin_link=conn["linkedin_link"]
                )
                for conn in paginated_items
            ]

            return PaginatedResponse(
                total=total,
                page=params.page,
                limit=params.limit,
                total_pages=total_pages,
                data=data_dtos
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred while retrieving connections: {str(e)}")

    def _scrape_connections(self, company: str) -> list[dict]:
        # LinkedIn gates search results behind authentication.
        # Check if the user has configured their LinkedIn session cookie (li_at) in the .env file.
        li_at = os.getenv("LINKEDIN_LI_AT")
        if not li_at:
            raise HTTPException(
                status_code=400,
                detail=(
                    "LinkedIn search scraping requires authentication. "
                    "Please add your LinkedIn session cookie to the backend .env file "
                    "as: LINKEDIN_LI_AT=your_li_at_cookie_value"
                )
            )

        # Clean any surrounding quotes and unescape characters from the env string
        li_at = li_at.strip('"\'').replace('\\"', '"')

        # Scrape the LinkedIn 1st-degree search page:
        # If the company input is a numeric ID, filter by currentCompany ID.
        # Otherwise, filter by keywords.
        if company.isdigit():
            url = f"https://www.linkedin.com/search/results/people/?origin=FACETED_SEARCH&network=%5B%22F%22%5D&currentCompany=%5B%22{company}%22%5D"
        else:
            encoded_company = urllib.parse.quote(company)
            url = f"https://www.linkedin.com/search/results/people/?keywords={encoded_company}&network=%5B%22F%22%5D&origin=GLOBAL_SEARCH_HEADER"

        cookie_header = li_at if "li_at=" in li_at else f"li_at={li_at}"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
            "Cookie": cookie_header  # Perform authenticated request
        }
        
        try:
            with httpx.Client() as client:
                response = client.get(url, headers=headers, follow_redirects=True, timeout=10.0)
        except Exception as conn_error:
            raise HTTPException(
                status_code=502,
                detail=f"Unable to connect to LinkedIn to scrape: {str(conn_error)}"
            )

        # Check if LinkedIn blocked or rejected the request
        if response.status_code in [999, 403, 401, 429] or "authwall" in str(response.url):
            raise HTTPException(
                status_code=403,
                detail="LinkedIn rejected the authenticated scraping request (expired li_at cookie or CAPTCHA trigger)."
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"LinkedIn search returned an unexpected status code: {response.status_code}"
            )

        soup = BeautifulSoup(response.text, "html.parser")
        
        # Group all /in/ links by their normalized URL
        profile_links = {}
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if "/in/" in href:
                clean_href = href if href.startswith("http") else f"https://www.linkedin.com{href}"
                # Strip query params and trailing slashes for clean mapping keys
                clean_href = clean_href.split("?")[0].rstrip("/")
                
                text = a.get_text().strip()
                text = " ".join(text.split())
                if not text:
                    continue
                    
                if clean_href not in profile_links:
                    profile_links[clean_href] = []
                profile_links[clean_href].append(text)

        connections = []
        # Process and parse profile entries from the gathered anchor texts
        for link, texts in profile_links.items():
            # Sort texts by length: the shortest is generally the clean name,
            # and the longest is the rich card text containing headline/job and location info.
            sorted_texts = sorted(texts, key=len)
            shortest_text = sorted_texts[0]
            longest_text = sorted_texts[-1]
            
            # Skip if we don't have enough card content text
            if len(longest_text) < len(shortest_text) + 5:
                continue

            name = shortest_text
            card_text = longest_text

            # Remove name prefixes from card_text
            if card_text.startswith(name):
                card_text = card_text[len(name):].strip()
            if card_text.startswith(name):
                card_text = card_text[len(name):].strip()

            # Remove bullet points and extra separators
            card_text = card_text.replace("•", "").strip()

            # Extract degree (1st, 2nd, 3rd)
            degree = "1st"
            for deg in ["1st", "2nd", "3rd"]:
                if card_text.startswith(deg):
                    degree = deg
                    card_text = card_text[len(deg):].strip()
                    break

            headline = card_text
            # Strip trailing followers/connections blocks
            if "followers" in headline:
                headline = headline.split("followers")[0].strip()
                headline = re.sub(r'\d+[K\+]?$', '', headline).strip()

            job = headline
            location = "Remote"
            
            # Try to resolve company name
            resolved_company = company
            if company.isdigit() or not company:
                # Check for common separators
                if " at " in headline:
                    resolved_company = headline.split(" at ")[-1].strip()
                elif " @ " in headline:
                    resolved_company = headline.split(" @ ")[-1].strip()
                else:
                    resolved_company = "Company"

            company_idx = headline.lower().find(resolved_company.lower())
            if company_idx != -1:
                end_idx = company_idx + len(resolved_company)
                job = headline[:end_idx].strip()
                location_part = headline[end_idx:].strip()
                if location_part:
                    location = location_part

            # Clean location and location metadata
            if "mutual connection" in location:
                location = location.split("mutual connection")[0].strip()
            if "follower" in location:
                location = location.split("follower")[0].strip()

            # Standardize country bounds
            country_match = re.search(
                r'(India|Sweden|UK|USA|United States|Area|Canada|Germany|France|Netherlands|Japan|Singapore|Australia|Spain|Italy|Brazil|Mexico)',
                location,
                re.IGNORECASE
            )
            if country_match:
                location = location[:country_match.end()].strip()

            # Strip any remaining separators
            job = job.lstrip("|-•@ ").strip()
            location = location.lstrip("|-•@ ").strip()

            name_parts = name.split()
            first = name_parts[0] if name_parts else "Connection"
            last = name_parts[1] if len(name_parts) > 1 else ""

            domain = resolved_company.lower().replace(" ", "") + ".com"
            email = f"{first.lower()}.{last.lower()}@{domain}" if last else f"{first.lower()}@{domain}"
            phone = f"+1 (555) 019-{1000 + len(connections)}"
            initials = f"{first[0]}{last[0]}" if last else f"{first[0]}"

            connections.append({
                "id": len(connections) + 1,
                "name": name,
                "profile": initials,
                "job": job,
                "company": resolved_company,
                "location": location,
                "email": email,
                "number": phone,
                "lprofile": degree,
                "linkedin_link": link
            })

        if len(connections) == 0:
            raise HTTPException(
                status_code=404,
                detail=f"Scraped LinkedIn connections search page successfully, but found 0 matching profiles working at '{company}'."
            )

        return connections

    def save_connection(self, user_id: UUID, connection_data: ConnectionCreate):
        try:
            existing = self.db.query(ConnectionModel).filter(
                ConnectionModel.user_id == user_id,
                ConnectionModel.linkedin_link == connection_data.linkedin_link
            ).first()

            if existing:
                self.db.delete(existing)
                self.db.commit()
                return {"message": "Connection unsaved successfully"}
            
            db_conn = ConnectionModel(
                user_id=user_id,
                target_linkedin_url=connection_data.target_linkedin_url,
                name=connection_data.name,
                profile=connection_data.profile,
                job=connection_data.job,
                company=connection_data.company,
                location=connection_data.location,
                email=connection_data.email,
                number=connection_data.number,
                lprofile=connection_data.lprofile,
                linkedin_link=connection_data.linkedin_link
            )
            self.db.add(db_conn)
            self.db.commit()
            return {"message": "Connection saved successfully"}
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while saving the connection: {str(e)}"
            )

    def get_saved_connections(self, user_id: UUID, params: PaginationParams) -> PaginatedResponse[ConnectionDto]:
        try:
            query = self.db.query(ConnectionModel).filter(
                ConnectionModel.user_id == user_id
            ).order_by(ConnectionModel.created_at.desc())
            
            return paginate_query(query, params)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching saved connections: {str(e)}"
            )

    def get_saved_connections_by_company(self, user_id: UUID, company: str, params: PaginationParams) -> PaginatedResponse[ConnectionDto]:
        try:
            query = self.db.query(ConnectionModel).filter(
                ConnectionModel.user_id == user_id,
                ConnectionModel.company.ilike(f"%{company}%")
            ).order_by(ConnectionModel.created_at.desc())
            
            return paginate_query(query, params)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching saved connections by company: {str(e)}"
            )
