from fastapi import APIRouter, Depends, Request
from typing import Annotated
from .job_applied_schema import SaveJobAppliedRequest, JobAppliedResponse
from .job_applied_service import JobAppliedService
from decorators.auth_decorators import requires_role
from enums.user_role import UserRole
from decorators.context_decorators import with_context

router = APIRouter(prefix="/job_applied", tags=["job_applied"])

@router.post("/save", response_model=JobAppliedResponse)
@with_context
@requires_role([UserRole.USER])
def save_job_applied(request: Request, body: SaveJobAppliedRequest, service: Annotated[JobAppliedService, Depends()]):
    user_id = request.state.user.get("sub")
    return service.save_job_applied(user_id, body)

from .job_applied_schema import SaveJobAppliedRequest, JobAppliedResponse, JobAppliedDetailResponse
from typing import List

@router.get("/list", response_model=List[JobAppliedResponse])
@with_context
@requires_role([UserRole.USER])
def get_applied_jobs(request: Request, service: Annotated[JobAppliedService, Depends()]):
    user_id = request.state.user.get("sub")
    return service.get_applied_jobs(user_id)

@router.get("/details/{job_id}", response_model=JobAppliedDetailResponse)
@with_context
@requires_role([UserRole.USER])
def get_applied_job_details(request: Request, job_id: str, service: Annotated[JobAppliedService, Depends()]):
    user_id = request.state.user.get("sub")
    return service.get_applied_job_details(user_id, job_id)
