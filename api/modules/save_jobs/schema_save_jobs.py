from uuid import UUID
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SavedJobCreate(BaseModel):
    job_id: str
    description: Optional[str] = None
    logo: Optional[str] = None
    job_type: Optional[str] = None
    location: Optional[str] = None
    date: Optional[str] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None

class SavedJobDto(BaseModel):
    id: UUID
    user_id: UUID
    job_id: str
    description: Optional[str] = None
    logo: Optional[str] = None
    job_type: Optional[str] = None
    location: Optional[str] = None
    date: Optional[str] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SavedJobResponse(BaseModel):
    message: str
