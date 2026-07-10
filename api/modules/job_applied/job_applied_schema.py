from uuid import UUID
from pydantic import BaseModel
from typing import Optional

class SaveJobAppliedRequest(BaseModel):
    job_id: str
    job_title: str
    company_name: str
    company_logo: Optional[str] = None
    job_description: Optional[str] = None
    job_type: Optional[str] = None
    location: Optional[str] = None
    apply_status: Optional[str] = "process"
    ats_resume_id: Optional[UUID] = None

class JobAppliedResponse(BaseModel):
    id: UUID
    user_id: UUID
    job_id: str
    job_title: str
    company_name: str
    apply_status: str

    class Config:
        from_attributes = True

class JobAppliedDetailResponse(JobAppliedResponse):
    company_logo: Optional[str] = None
    job_description: Optional[str] = None
    job_type: Optional[str] = None
    location: Optional[str] = None
    ats_resume_id: Optional[UUID] = None
