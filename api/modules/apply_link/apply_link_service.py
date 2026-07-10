from uuid import UUID
import httpx
import re
import urllib.parse
from bs4 import BeautifulSoup
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from core.supabase import get_db
from shared.database.model_ats_resume import AtsResumeModel
from .apply_link_schema import (
    ApplyLinkSearchRequest, 
    ApplyLinkSearchResponse, 
    ApplyLinkItem,
    UpdateApplyStatusRequest,
    UpdateApplyStatusResponse,
    ApplyStatusItemSchema
)

def is_valid_job_link(href: str, domain: str, title: str) -> bool:
    href_lower = href.lower()
    domain_lower = domain.lower()
    
    # Blacklist known non-job and news/media/educational/forum domains
    blacklist = {
        "wikipedia.org", "techcrunch.com", "nytimes.com", "forbes.com", "bloomberg.com",
        "reuters.com", "cnn.com", "medium.com", "reddit.com", "quora.com", "youtube.com",
        "twitter.com", "x.com", "facebook.com", "instagram.com", "github.com",
        "stackoverflow.com", "w3schools.com", "geeksforgeeks.org", "ycombinator.com",
        "news.ycombinator.com", "techmeme.com", "wsj.com", "ft.com", "theguardian.com",
        "crunchbase.com"
    }
    
    # Check if domain is blacklisted or ends with blacklisted domain
    for blacklisted in blacklist:
        if domain_lower == blacklisted or domain_lower.endswith("." + blacklisted):
            return False
            
    # Exclude common news/blog keywords in domain name
    if any(kw in domain_lower for kw in ["news", "blog", "press", "media", "forum"]):
        return False
        
    # Known ATS domains are always valid job links
    ats_keywords = [
        "greenhouse.io", "lever.co", "workable.com", "smartrecruiters.com",
        "myworkdayjobs.com", "ashbyhq.com", "bamboohr.com", "breezy.hr", "recruitee.com"
    ]
    if any(ats in domain_lower for ats in ats_keywords):
        pass # Will do segment check next
    else:
        # Job boards are always valid
        job_board_keywords = ["linkedin.com", "indeed.com", "glassdoor.com", "ziprecruiter.com", "simplyhired.com"]
        if any(board in domain_lower for board in job_board_keywords):
            return True

    # Validate that it is a specific job posting and not a generic career landing page
    url_parts = urllib.parse.urlparse(href_lower)
    path = url_parts.path.strip("/")
    segments = [s for s in path.split("/") if s]
    
    # If the path is empty, it's just the homepage - definitely not a specific job
    if not segments:
        return False
        
    # List of generic pages to exclude
    generic_pages = {"careers", "jobs", "job", "career", "join", "apply", "workat", "working"}
    if len(segments) == 1 and segments[0] in generic_pages:
        return False
        
    # Check if there is a numeric ID (at least 4 consecutive digits anywhere in path or query)
    if re.search(r'\d{4,}', href_lower):
        return True
        
    # Check if the title words are present as a slug in the URL
    title_slug = re.sub(r'\s+', '-', re.sub(r'[^\w\s]', '', title.lower())).strip("-")
    if title_slug and (title_slug in href_lower or title_slug.replace("-", "_") in href_lower):
        return True
        
    # Fallback keyword match: check if at least two title keywords are in the URL path
    title_keywords = [w for w in re.findall(r"\w+", title.lower()) if len(w) > 3]
    if title_keywords:
        matched_keywords = [w for w in title_keywords if w in path]
        if len(matched_keywords) >= min(2, len(title_keywords)):
            return True
            
    # Check if any segment is a long unique string of at least 8 chars with letters/numbers
    for seg in segments:
        if len(seg) >= 8 and any(c.isdigit() for c in seg) and any(c.isalpha() for c in seg):
            return True
            
    return False

class ApplyLinkService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def update_apply_status(self, user_id: UUID, request: UpdateApplyStatusRequest) -> UpdateApplyStatusResponse:
        # Fetch the AtsResumeModel for this job_id & user_id
        ats_resume = self.db.query(AtsResumeModel).filter(
            AtsResumeModel.user_id == user_id,
            AtsResumeModel.job_id == request.job_id
        ).first()
        
        if not ats_resume:
            raise HTTPException(status_code=404, detail="ATS Resume not found for this job. Please build/tailor your resume first.")
            
        # Get or initialize apply_statuses
        apply_statuses = ats_resume.apply_statuses
        if apply_statuses is None or not isinstance(apply_statuses, list):
            apply_statuses = []
            
        # Check if same platform name and apply link already exist
        updated = False
        for entry in apply_statuses:
            if isinstance(entry, dict):
                if entry.get("platform") == request.platform and entry.get("url") == request.url:
                    entry["status"] = request.status
                    updated = True
                    break
                    
        # Add new status entry if not found
        if not updated:
            apply_statuses.append({
                "platform": request.platform,
                "url": request.url,
                "status": request.status
            })
            
        # Save back and commit
        ats_resume.apply_statuses = apply_statuses
        flag_modified(ats_resume, "apply_statuses")

        # Update the overarching apply_status in JobAppliedModel if status is 'applied'
        if request.status == "applied":
            from shared.database.model_job_applied import JobAppliedModel
            job_applied = self.db.query(JobAppliedModel).filter(
                JobAppliedModel.user_id == user_id,
                JobAppliedModel.job_id == request.job_id
            ).first()
            if job_applied:
                job_applied.apply_status = "applied"
        
        self.db.commit()
        self.db.refresh(ats_resume)
        
        formatted_statuses = []
        for entry in apply_statuses:
            if isinstance(entry, dict):
                formatted_statuses.append(ApplyStatusItemSchema(
                    platform=entry.get("platform", ""),
                    url=entry.get("url", ""),
                    status=entry.get("status", "")
                ))
                
        return UpdateApplyStatusResponse(
            success=True,
            message="Apply status updated successfully",
            apply_statuses=formatted_statuses
        )

    async def search_links(self, user_id: UUID, request: ApplyLinkSearchRequest) -> ApplyLinkSearchResponse:
        company = request.company_name
        title = request.job_title
        
        # 1. Fetch saved statuses first to map them to URLs
        ats_resume = self.db.query(AtsResumeModel).filter(
            AtsResumeModel.user_id == user_id,
            AtsResumeModel.job_id == request.job_id
        ).first()
        
        # If we have saved apply statuses in db, return them directly
        if ats_resume and ats_resume.apply_statuses:
            links = []
            for entry in ats_resume.apply_statuses:
                if isinstance(entry, dict) and entry.get("url"):
                    platform = entry.get("platform", "Company Site")
                    logo = entry.get("logo") or f"https://www.google.com/s2/favicons?sz=64&domain={urllib.parse.urlparse(entry.get('url')).netloc}"
                    description = entry.get("description") or f"Apply for the {title} position at {company} via {platform}."
                    status = entry.get("status", "not_applied")
                    
                    links.append(ApplyLinkItem(
                        platform=platform,
                        logo=logo,
                        url=entry.get("url"),
                        description=description,
                        status=status
                    ))
            if links:
                return ApplyLinkSearchResponse(links=links)
        
        saved_statuses = {}
        if ats_resume and ats_resume.apply_statuses:
            for entry in ats_resume.apply_statuses:
                if isinstance(entry, dict):
                    saved_statuses[entry.get("url")] = entry.get("status", "not_applied")
        
        # Clean company name to remove common suffixes like Inc., Co., Corp., LLC, Ltd.
        cleaned_company = re.sub(r'\b(inc|co|corp|llc|ltd|gmbh|sa|pvt|pty|limited|corporation)\b\.?', '', company, flags=re.IGNORECASE).strip()
        if not cleaned_company:
            cleaned_company = company
        company_lower = cleaned_company.lower()
        
        # Try different search queries, prioritizing direct company career page searches
        queries = [
            f'{cleaned_company} careers {title}',
            f'{cleaned_company} jobs {title}',
            f'{cleaned_company} {title} apply'
        ]
        
        user_agents = [
            "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
            "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)"
        ]
        
        links = []
        for query in queries:
            if len(links) >= 3:
                break
                
            encoded_query = urllib.parse.quote(query)
            google_url = f"https://www.google.com/search?q={encoded_query}"
            ddg_url = f"https://html.duckduckgo.com/html/?q={encoded_query}"
            
            # 1. Try Google Search Scraping first
            google_success = False
            for ua in user_agents:
                headers = {"User-Agent": ua}
                try:
                    async with httpx.AsyncClient() as client:
                        response = await client.get(google_url, headers=headers, timeout=10.0)
                        response.raise_for_status()
                        
                        soup = BeautifulSoup(response.text, "html.parser")
                        h3_tags = soup.find_all("h3")
                        if not h3_tags:
                            continue # Try next User-Agent if Google blocked us or returned no titles
                            
                        # Organic search results parsing
                        google_found_any = False
                        for h3 in h3_tags:
                            parent = h3.parent
                            while parent and parent.name != "a":
                                parent = parent.parent
                                
                            if not parent:
                                continue
                                
                            href = parent.get("href")
                            if not href:
                                continue
                                
                            # Handle Google redirect links: /url?q=URL
                            if href.startswith("/url?"):
                                match = re.search(r"q=([^&]+)", href)
                                if match:
                                    href = urllib.parse.unquote(match.group(1))
                                    
                            if not href.startswith("http"):
                                continue
                                
                            domain_match = re.search(r"https?://(?:www\.)?([^/]+)", href)
                            domain = domain_match.group(1) if domain_match else ""
                            domain_lower = domain.lower()
                            
                            # Skip actual search engine search result pages, not organic site results (like careers.google.com)
                            if "google.com/search" in href.lower() or "google.com/url" in href.lower():
                                continue
                                
                            # Find snippet/description in parent tree
                            snippet = ""
                            container = parent
                            for _ in range(5):
                                if not container:
                                    break
                                snippet_elem = container.find("div", class_="VwiC3b") or container.find("span", class_="aCOp2e")
                                if snippet_elem:
                                    snippet = snippet_elem.get_text()
                                    break
                                container = container.parent
                                
                            title_text = h3.get_text()
                            
                            # Clean company and title for check
                            title_lower = title.lower()
                            result_title_lower = title_text.lower()
                            result_snippet_lower = snippet.lower() if snippet else ""
                            
                            # Match company: check if company name in title, snippet, or URL
                            company_match = (
                                company_lower in result_title_lower or 
                                company_lower in href.lower() or
                                (result_snippet_lower and company_lower in result_snippet_lower)
                            )
                            
                            # Match job role: check if main keywords of title match
                            title_keywords = [w for w in re.findall(r"\w+", title_lower) if len(w) > 2]
                            if not title_keywords:
                                title_keywords = [title_lower]
                                
                            matched_keywords = [w for w in title_keywords if w in result_title_lower or w in result_snippet_lower]
                            role_match = len(matched_keywords) >= max(1, len(title_keywords) // 2)
                            
                            if not (company_match and role_match and is_valid_job_link(href, domain, title)):
                                continue
                                
                            # Identify platform
                            platform = "Company Site"
                            if "linkedin.com" in domain_lower:
                                platform = "LinkedIn"
                            elif "indeed.com" in domain_lower:
                                platform = "Indeed"
                            elif "glassdoor.com" in domain_lower:
                                platform = "Glassdoor"
                            elif "greenhouse.io" in domain_lower:
                                platform = "Greenhouse"
                            elif "lever.co" in domain_lower:
                                platform = "Lever"
                            elif "workable.com" in domain_lower:
                                platform = "Workable"
                            elif "smartrecruiters.com" in domain_lower:
                                platform = "SmartRecruiters"
                            elif "ziprecruiter.com" in domain_lower:
                                platform = "ZipRecruiter"
                            elif "simplyhired.com" in domain_lower:
                                platform = "SimplyHired"
                            elif "myworkdayjobs.com" in domain_lower:
                                platform = "Workday"
                            elif "ashbyhq.com" in domain_lower:
                                platform = "Ashby"
                            elif "bamboohr.com" in domain_lower:
                                platform = "BambooHR"
                            elif "breezy.hr" in domain_lower:
                                platform = "Breezy HR"
                            elif "recruitee.com" in domain_lower:
                                platform = "Recruitee"
                            else:
                                # Extract root name as platform
                                parts = domain.split(".")
                                if len(parts) >= 2:
                                    if parts[-2] in {"co", "com", "net", "org", "gov"} and len(parts) >= 3:
                                        platform = parts[-3].capitalize()
                                    else:
                                        platform = parts[-2].capitalize()
                                    
                            logo = f"https://www.google.com/s2/favicons?sz=64&domain={domain}"
                            
                            if platform.lower() == company_lower:
                                description = f"Apply directly on the {company} careers portal."
                            else:
                                description = f"Apply for the {title} position at {company} via {platform}."
                            
                            # Avoid duplicate URLs and duplicate platforms
                            if not any(lk.url == href or lk.platform == platform for lk in links):
                                links.append(ApplyLinkItem(
                                    platform=platform,
                                    logo=logo,
                                    url=href,
                                    description=description,
                                    status=saved_statuses.get(href, "not_applied")
                                ))
                                google_found_any = True
                            
                            # Limit to top 5 matching links
                            if len(links) >= 5:
                                break
                        
                        # If we found organic results with this User-Agent, break the User-Agent loop
                        if google_found_any:
                            google_success = True
                            break
                except Exception as e:
                    print(f"Error scraping Google apply links: {str(e)}")
            
            # 2. If Google failed (or was blocked), fallback to DuckDuckGo search
            if not google_success:
                for ua in user_agents:
                    headers = {"User-Agent": ua}
                    try:
                        async with httpx.AsyncClient() as client:
                            response = await client.get(ddg_url, headers=headers, timeout=10.0)
                            response.raise_for_status()
                            
                            soup = BeautifulSoup(response.text, "html.parser")
                            results = soup.find_all("div", class_="result")
                            if not results:
                                continue
                                
                            ddg_found_any = False
                            for res in results:
                                a_title = res.find("a", class_="result__a")
                                if not a_title:
                                    continue
                                    
                                href = a_title.get("href")
                                if not href:
                                    continue
                                    
                                # Extract clean URL from DDG redirect
                                real_url = ""
                                match = re.search(r"uddg=([^&]+)", href)
                                if match:
                                    real_url = urllib.parse.unquote(match.group(1))
                                else:
                                    if href.startswith("//"):
                                        real_url = "https:" + href
                                    else:
                                        real_url = href
                                        
                                if not real_url.startswith("http"):
                                    continue
                                    
                                domain_match = re.search(r"https?://(?:www\.)?([^/]+)", real_url)
                                domain = domain_match.group(1) if domain_match else ""
                                domain_lower = domain.lower()
                                
                                # Skip actual search engine search result pages, not organic site results (like careers.google.com)
                                if "google.com/search" in real_url.lower() or "google.com/url" in real_url.lower() or "duckduckgo.com" in real_url.lower():
                                    continue
                                    
                                snippet_elem = res.find("a", class_="result__snippet")
                                snippet = snippet_elem.get_text().strip() if snippet_elem else ""
                                title_text = a_title.get_text().strip()
                                
                                title_lower = title.lower()
                                result_title_lower = title_text.lower()
                                result_snippet_lower = snippet.lower()
                                
                                # Match company: check if company name in title, snippet, or URL
                                company_match = (
                                    company_lower in result_title_lower or 
                                    company_lower in real_url.lower() or
                                    (result_snippet_lower and company_lower in result_snippet_lower)
                                )
                                
                                # Match job role: check if main keywords of title match
                                title_keywords = [w for w in re.findall(r"\w+", title_lower) if len(w) > 2]
                                if not title_keywords:
                                    title_keywords = [title_lower]
                                    
                                matched_keywords = [w for w in title_keywords if w in result_title_lower or w in result_snippet_lower]
                                role_match = len(matched_keywords) >= max(1, len(title_keywords) // 2)
                                
                                if not (company_match and role_match and is_valid_job_link(real_url, domain, title)):
                                    continue
                                    
                                # Identify platform
                                platform = "Company Site"
                                if "linkedin.com" in domain_lower:
                                    platform = "LinkedIn"
                                elif "indeed.com" in domain_lower:
                                    platform = "Indeed"
                                elif "glassdoor.com" in domain_lower:
                                    platform = "Glassdoor"
                                elif "greenhouse.io" in domain_lower:
                                    platform = "Greenhouse"
                                elif "lever.co" in domain_lower:
                                    platform = "Lever"
                                elif "workable.com" in domain_lower:
                                    platform = "Workable"
                                elif "smartrecruiters.com" in domain_lower:
                                    platform = "SmartRecruiters"
                                elif "ziprecruiter.com" in domain_lower:
                                    platform = "ZipRecruiter"
                                elif "simplyhired.com" in domain_lower:
                                    platform = "SimplyHired"
                                elif "myworkdayjobs.com" in domain_lower:
                                    platform = "Workday"
                                elif "ashbyhq.com" in domain_lower:
                                    platform = "Ashby"
                                elif "bamboohr.com" in domain_lower:
                                    platform = "BambooHR"
                                elif "breezy.hr" in domain_lower:
                                    platform = "Breezy HR"
                                elif "recruitee.com" in domain_lower:
                                    platform = "Recruitee"
                                else:
                                    parts = domain.split(".")
                                    if len(parts) >= 2:
                                        if parts[-2] in {"co", "com", "net", "org", "gov"} and len(parts) >= 3:
                                            platform = parts[-3].capitalize()
                                        else:
                                            platform = parts[-2].capitalize()
                                            
                                logo = f"https://www.google.com/s2/favicons?sz=64&domain={domain}"
                                
                                if platform.lower() == company_lower:
                                    description = f"Apply directly on the {company} careers portal."
                                else:
                                    description = f"Apply for the {title} position at {company} via {platform}."
                                    
                                # Avoid duplicate URLs and duplicate platforms
                                if not any(lk.url == real_url or lk.platform == platform for lk in links):
                                    links.append(ApplyLinkItem(
                                        platform=platform,
                                        logo=logo,
                                        url=real_url,
                                        description=description,
                                        status=saved_statuses.get(real_url, "not_applied")
                                    ))
                                    ddg_found_any = True
                                    
                                if len(links) >= 5:
                                    break
                            
                            if ddg_found_any:
                                break
                    except Exception as e:
                        print(f"Error scraping DDG apply links: {str(e)}")
            
        # Fallback to direct LinkedIn link if no results found
        if not links:
            linkedin_url = f"https://www.linkedin.com/jobs/view/{request.job_id}"
            links.append(ApplyLinkItem(
                platform="LinkedIn",
                logo="https://www.google.com/s2/favicons?sz=64&domain=linkedin.com",
                url=linkedin_url,
                description=f"Apply for the {title} position at {company} via LinkedIn.",
                status=saved_statuses.get(linkedin_url, "not_applied")
            ))
            
        # Cache the scraped links in the DB if ats_resume exists
        if ats_resume and links:
            ats_resume.apply_statuses = [
                {
                    "platform": lk.platform,
                    "logo": lk.logo,
                    "url": lk.url,
                    "description": lk.description,
                    "status": lk.status or "not_applied"
                }
                for lk in links
            ]
            flag_modified(ats_resume, "apply_statuses")
            self.db.commit()
            
        return ApplyLinkSearchResponse(links=links)
