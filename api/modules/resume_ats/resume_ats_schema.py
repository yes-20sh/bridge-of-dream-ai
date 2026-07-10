from uuid import UUID
from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class ResumeResponse(BaseModel):
    id: UUID
    user_id: UUID
    cloudinary_url: str
    extracted_data: Optional[Any] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ResumeUpdateRequest(BaseModel):
    job_id: str
    old_text: str
    new_text: str

class KeywordAnalysisItem(BaseModel):
    keyword: str
    priority: str
    weightage: int
    is_matching: bool
    old_sentence: Optional[str] = None
    new_sentence: Optional[str] = None

class AnalyzeKeywordsRequest(BaseModel):
    job_id: str

class AnalyzeKeywordsResponse(BaseModel):
    id: Optional[UUID] = None
    analysis_data: list[KeywordAnalysisItem]

class ProcessAtsResumeRequest(BaseModel):
    job_id: str
    job_description: str

class ProcessAtsResumeResponse(BaseModel):
    success: bool
    message: str
