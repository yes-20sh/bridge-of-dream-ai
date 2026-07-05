from pydantic import BaseModel
from typing import List, Optional, Dict
from enum import Enum

class JobSearchFilterResponse(BaseModel):
    id: int
    jobRoles: Optional[List[str]] = None
    jobTypes: Optional[List[str]] = None
    locations: Optional[List[str]] = None
    companies: Optional[List[str]] = None

    class Config:
        from_attributes = True

class TimeFilter(str, Enum):
    DAY = "day"     
    WEEK = "week"   
    MONTH = "month" 

class JobSearchRequest(BaseModel):
    keyword: Optional[str] = ""
    location: Optional[str] = ""
    job_roles: Optional[List[str]] = None
    job_types: Optional[List[str]] = None
    locations: Optional[List[str]] = None
    companies: Optional[List[str]] = None
    duration: Optional[TimeFilter] = None
    page: Optional[int] = 1
    limit: Optional[int] = 10

class JobResponse(BaseModel):
    job_id: Optional[str] = None
    job_url: Optional[str] = None
    company_name: str
    company_logo: Optional[str] = None
    posted_days: Optional[str] = None
    job_title: str
    role: Optional[str] = None
    location: str

class PaginatedJobResponse(BaseModel):
    jobs: List[JobResponse]
    page: int
    limit: int
    total_estimated: Optional[int] = None

class JobDetailRequest(BaseModel):
    job_id: Optional[str] = None
    job_url: str

class JobDetailResponse(BaseModel):
    job_id: Optional[str] = None
    job_url: Optional[str] = None
    company_name: Optional[str] = None
    company_logo: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    posted_date: Optional[str] = None
    apply_status: Optional[str] = None
