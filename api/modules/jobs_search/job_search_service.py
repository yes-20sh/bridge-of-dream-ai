import httpx
import asyncio
from bs4 import BeautifulSoup
import urllib.parse
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from core.supabase import get_db
from shared.database.model_user import UserModel
from shared.database.model_last_search import LastSearchModel
from .job_search_schema import JobSearchFilterResponse, JobSearchRequest, PaginatedJobResponse, JobResponse, TimeFilter, JobDetailRequest, JobDetailResponse

class JobSearchService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
        
    def get_user_job_filter(self, user_id: int) -> JobSearchFilterResponse:
        user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        return JobSearchFilterResponse(
            id=user.id,
            jobRoles=user.job_roles,
            jobTypes=user.job_types,
            locations=user.locations,
            companies=user.companies
        )

    def update_last_search(self, user_id: int, request: JobSearchRequest):
        filters_dict = {
            "job_roles": request.job_roles,
            "job_types": request.job_types,
            "locations": request.locations,
            "companies": request.companies,
            "duration": request.duration.value if request.duration else None
        }

        last_search = self.db.query(LastSearchModel).filter(LastSearchModel.user_id == user_id).first()
        
        if last_search:
            last_search.keyword = request.keyword
            last_search.location = request.location
            last_search.filters = filters_dict
        else:
            last_search = LastSearchModel(
                user_id=user_id,
                keyword=request.keyword,
                location=request.location,
                filters=filters_dict
            )
            self.db.add(last_search)
            
        self.db.commit()
        self.db.refresh(last_search)
        return last_search

    def get_last_search(self, user_id: int) -> Optional[LastSearchModel]:
        return self.db.query(LastSearchModel).filter(LastSearchModel.user_id == user_id).first()

    async def scrape_jobs(self, request: JobSearchRequest, user_id: Optional[int] = None) -> PaginatedJobResponse:
        # Check if request has no search keyword, location, or filters (is empty)
        is_empty_search = (
            not request.keyword and
            not request.location and
            not request.job_roles and
            not request.job_types and
            not request.locations and
            not request.companies and
            not request.duration
        )
        
        if is_empty_search and user_id:
            # Load search criteria from the user's last search model
            last_search = self.get_last_search(user_id)
            if last_search:
                request.keyword = last_search.keyword or ""
                request.location = last_search.location or ""
                
                filters = last_search.filters or {}
                request.job_roles = filters.get("job_roles")
                request.job_types = filters.get("job_types")
                request.locations = filters.get("locations")
                request.companies = filters.get("companies")
                
                duration_val = filters.get("duration")
                if duration_val:
                    try:
                        request.duration = TimeFilter(duration_val)
                    except ValueError:
                        request.duration = None
            else:
                # Fallback defaults for new users
                request.keyword = "Software Engineer"
                request.location = "India"
        elif not is_empty_search and user_id:
            # Update the last search model for the user
            self.update_last_search(user_id, request)

        # Fallback defaults if keyword or location are still empty/missing
        if not request.keyword:
            request.keyword = "Software Engineer"
        if not request.location:
            request.location = "India"
        # Build composite keyword combining search term, roles, types, companies
        composite_keywords = []
        if request.keyword:
            composite_keywords.append(request.keyword)
        if request.job_roles:
            composite_keywords.extend(request.job_roles)
        if request.job_types:
            composite_keywords.extend(request.job_types)
        if request.companies:
            composite_keywords.extend(request.companies)
            
        keyword_str = " ".join(composite_keywords)
        
        # Build composite location combining search location and filter locations
        composite_locations = []
        if request.location:
            composite_locations.append(request.location)
        if request.locations:
            composite_locations.extend(request.locations)
            
        location_str = " ".join(composite_locations)

        kw = urllib.parse.quote(keyword_str)
        loc = urllib.parse.quote(location_str)
        
        # Calculate pagination start (LinkedIn pagination is typically by 25)
        # But we will use the requested limit, defaulting to 10
        limit = request.limit if request.limit else 10
        page = request.page if request.page else 1
        start = (page - 1) * limit
        
        url = f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={kw}&location={loc}&start={start}"
        
        if request.duration:
            time_mapping = {
                TimeFilter.DAY: "r86400",
                TimeFilter.WEEK: "r604800",
                TimeFilter.MONTH: "r2592000"
            }
            if request.duration in time_mapping:
                url += f"&f_TPR={time_mapping[request.duration]}"
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, timeout=10.0)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, "html.parser")
                job_cards = soup.find_all("li")
                
                async def fetch_job_details(job_card):
                    try:
                        title_elem = job_card.find("h3", class_="base-search-card__title")
                        company_elem = job_card.find("h4", class_="base-search-card__subtitle")
                        location_elem = job_card.find("span", class_="job-search-card__location")
                        date_elem = job_card.find("time")
                        img_elem = job_card.find("img")
                        
                        link_elem = job_card.find("a", class_="base-card__full-link") or job_card.find("a")
                        job_url = link_elem.get("href") if link_elem else None
                        
                        job_id = None
                        div_card = job_card.find("div", class_="base-card")
                        urn = div_card.get("data-entity-urn") if div_card else job_card.get("data-entity-urn")
                        
                        if urn:
                            job_id = urn.split(":")[-1]
                        elif job_url and "view/" in job_url:
                            try:
                                job_id = job_url.split("view/")[1].split("/")[0].split("?")[0]
                            except:
                                pass
                        
                        if not (title_elem and company_elem and location_elem):
                            return None

                        date_str = None
                        if date_elem:
                            date_str = date_elem.text.strip()
                            
                        logo_url = None
                        if img_elem:
                            logo_url = img_elem.get("data-delayed-url") or img_elem.get("src")

                        return JobResponse(
                            job_id=job_id,
                            job_url=job_url,
                            company_name=company_elem.text.strip(),
                            company_logo=logo_url,
                            posted_days=date_str,
                            job_title=title_elem.text.strip(),
                            role=request.job_roles[0] if request.job_roles else "Full-time",
                            location=location_elem.text.strip()
                        )
                    except Exception as e:
                        return None

                tasks = []
                # Fetch up to 'limit' items
                for card in job_cards[:limit]:
                    tasks.append(fetch_job_details(card))
                    
                results = await asyncio.gather(*tasks)
                jobs = [j for j in results if j is not None]
                
                return PaginatedJobResponse(
                    jobs=jobs,
                    page=page,
                    limit=limit,
                    total_estimated=None # LinkedIn doesn't return total count easily on this endpoint
                )
                
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Failed to fetch jobs: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred while scraping: {str(e)}")

    async def scrape_job_details(self, user_id: int, request: JobDetailRequest) -> JobDetailResponse:
        from shared.database.model_job_applied import JobAppliedModel
        
        applied_job = self.db.query(JobAppliedModel).filter(
            JobAppliedModel.user_id == user_id,
            JobAppliedModel.job_id == request.job_id
        ).first()
        
        if applied_job and applied_job.job_description:
            return JobDetailResponse(
                job_id=applied_job.job_id,
                job_url=request.job_url,
                company_name=applied_job.company_name,
                company_logo=applied_job.company_logo,
                job_title=applied_job.job_title,
                location=applied_job.location,
                description=applied_job.job_description,
                posted_date=None,
                apply_status=applied_job.apply_status
            )

        url = request.job_url
        if not url.startswith("http"):
            raise HTTPException(status_code=400, detail="Invalid job URL")
            
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, timeout=10.0, follow_redirects=True)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, "html.parser")
                
                title_elem = soup.find("h1", class_="top-card-layout__title")
                company_elem = soup.find("a", class_="topcard__org-name-link")
                location_elem = soup.find("span", class_="topcard__flavor--bullet")
                desc_elem = soup.find("div", class_="show-more-less-html__markup") or soup.find("div", class_="description__text")
                posted_elem = soup.find("span", class_="posted-time-ago__text")
                
                logo_container = soup.find("a", class_="topcard__logo-container")
                logo_elem = logo_container.find("img") if logo_container else None
                if not logo_elem:
                    logo_elem = soup.find("img", class_="artdeco-entity-image")
                
                logo_url = None
                if logo_elem:
                    logo_url = logo_elem.get("data-delayed-url") or logo_elem.get("src")

                return JobDetailResponse(
                    job_id=request.job_id,
                    job_url=request.job_url,
                    company_name=company_elem.text.strip() if company_elem else None,
                    company_logo=logo_url,
                    job_title=title_elem.text.strip() if title_elem else None,
                    location=location_elem.text.strip() if location_elem else None,
                    description=desc_elem.get_text(separator="\n", strip=True) if desc_elem else None,
                    posted_date=posted_elem.text.strip() if posted_elem else None
                )
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Failed to fetch job details: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred while scraping job details: {str(e)}")
