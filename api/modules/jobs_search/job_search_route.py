from fastapi import APIRouter, Depends, Request
from typing import Annotated
from decorators.auth_decorators import requires_role
from enums.user_role import UserRole
from decorators.context_decorators import with_context
from .job_search_schema import JobSearchFilterResponse, JobSearchRequest, PaginatedJobResponse, JobDetailRequest, JobDetailResponse
from .job_search_service import JobSearchService

router = APIRouter(prefix="/jobs-search", tags=["Job Search"])

@router.get("/filter", response_model=JobSearchFilterResponse)
@with_context
@requires_role([UserRole.USER])
def get_job_filter(request: Request, service: Annotated[JobSearchService, Depends()]):
    user_id = request.state.user.get("sub")
    return service.get_user_job_filter(user_id)

@router.post("/search", response_model=PaginatedJobResponse)
@with_context
@requires_role([UserRole.USER])
async def search_jobs(
    request: Request, 
    payload: JobSearchRequest, 
    service: Annotated[JobSearchService, Depends()]
):
    user_id = request.state.user.get("sub")
    result = await service.scrape_jobs(payload, user_id=user_id)
    return result

@router.post("/job-details", response_model=JobDetailResponse)
@with_context
@requires_role([UserRole.USER])
async def get_job_details(
    request: Request,
    payload: JobDetailRequest,
    service: Annotated[JobSearchService, Depends()]
):
    user_id = request.state.user.get("sub")
    # Retrieve complete job details via URL scraping or DB
    return await service.scrape_job_details(user_id, payload)
