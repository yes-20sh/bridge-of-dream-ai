from uuid import UUID
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    jobRoles: Optional[List[str]] = None
    jobTypes: Optional[List[str]] = None
    locations: Optional[List[str]] = None
    companies: Optional[List[str]] = None

class ResumeResponse(BaseModel):
    id: UUID
    user_id: UUID
    cloudinary_url: str
    extracted_data: Optional[Any] = None

    class Config:
        from_attributes = True

class UserProfileResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    mobile: Optional[str] = None
    jobRoles: Optional[List[str]] = None
    jobTypes: Optional[List[str]] = None
    locations: Optional[List[str]] = None
    companies: Optional[List[str]] = None
    resume: Optional[ResumeResponse] = None

    class Config:
        from_attributes = True
