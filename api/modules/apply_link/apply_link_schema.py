from pydantic import BaseModel
from typing import List, Optional

class ApplyLinkSearchRequest(BaseModel):
    job_id: str
    job_title: str
    company_name: str

class ApplyLinkItem(BaseModel):
    platform: str
    logo: str
    url: str
    description: str
    status: Optional[str] = "not_applied"

class ApplyLinkSearchResponse(BaseModel):
    links: List[ApplyLinkItem]

class ApplyStatusItemSchema(BaseModel):
    platform: str
    url: str
    status: str

class UpdateApplyStatusRequest(BaseModel):
    job_id: str
    platform: str
    url: str
    status: str

class UpdateApplyStatusResponse(BaseModel):
    success: bool
    message: str
    apply_statuses: List[ApplyStatusItemSchema]
