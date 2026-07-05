from fastapi import APIRouter, Depends, Request
from typing import Annotated
from decorators.auth_decorators import user
from decorators.context_decorators import with_context
from .resume_ats_schema import ResumeResponse, ResumeUpdateRequest
from .resume_ats_service import ResumeAtsService

router = APIRouter(prefix="/resume-ats", tags=["Resume ATS"])

@router.get("/resume", response_model=ResumeResponse)
@with_context
@user
def get_resume(request: Request, job_id: str, service: Annotated[ResumeAtsService, Depends()]):
    user_id = int(request.state.user.get("sub"))
    return service.get_resume(user_id, job_id)

@router.put("/resume", response_model=ResumeResponse)
@with_context
@user
def update_resume(request: Request, body: ResumeUpdateRequest, service: Annotated[ResumeAtsService, Depends()]):
    user_id = int(request.state.user.get("sub"))
    return service.update_resume(user_id, body.job_id, body.old_text, body.new_text)

from .resume_ats_schema import AnalyzeKeywordsRequest, AnalyzeKeywordsResponse, ProcessAtsResumeRequest, ProcessAtsResumeResponse

@router.post("/keywords/analyze", response_model=AnalyzeKeywordsResponse)
@with_context
@user
def analyze_keywords(request: Request, body: AnalyzeKeywordsRequest, service: Annotated[ResumeAtsService, Depends()]):
    user_id = int(request.state.user.get("sub"))
    return service.get_keyword_analysis(user_id, body.job_id)

@router.post("/generate", response_model=ProcessAtsResumeResponse)
@with_context
@user
def process_ats_resume(request: Request, body: ProcessAtsResumeRequest, service: Annotated[ResumeAtsService, Depends()]):
    user_id = int(request.state.user.get("sub"))
    return service.process_ats_resume(user_id, body.job_id, body.job_description)
