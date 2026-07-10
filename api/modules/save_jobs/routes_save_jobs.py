from typing import Annotated
from fastapi import APIRouter, Depends, status, Request
from decorators.auth_decorators import requires_role
from enums.user_role import UserRole
from decorators.context_decorators import with_context
from shared.pagination.pagination_schema import PaginationParams, PaginatedResponse
from .schema_save_jobs import SavedJobCreate, SavedJobDto, SavedJobResponse
from .services_save_jobs import SaveJobService

router = APIRouter(prefix="/saved-jobs", tags=["Saved Jobs"])

@router.post("/save", response_model=SavedJobResponse, status_code=status.HTTP_200_OK)
@with_context
@requires_role([UserRole.USER])
def save_job(
    request: Request,
    job_data: SavedJobCreate,
    service: Annotated[SaveJobService, Depends()]
):
    user_id = request.state.user.get("sub")
    return service.save_job(user_id=user_id, job_data=job_data)

@router.get("/all", response_model=PaginatedResponse[SavedJobDto], status_code=status.HTTP_200_OK)
@with_context
@requires_role([UserRole.USER])
def get_all_saved_jobs(
    request: Request,
    params: Annotated[PaginationParams, Depends()],
    service: Annotated[SaveJobService, Depends()]
):
    user_id = request.state.user.get("sub")
    return service.get_saved_jobs(user_id=user_id, params=params)
