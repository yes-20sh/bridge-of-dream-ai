from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from typing import Optional, Annotated
from .schema_user import UserProfileUpdate, UserProfileResponse, ResumeResponse
from .services_user import UserService
from decorators.auth_decorators import requires_role
from enums.user_role import UserRole
from decorators.context_decorators import with_context

router = APIRouter(prefix="/user", tags=["User Profile"])

@router.get("/profile", response_model=UserProfileResponse)
@with_context
@requires_role([UserRole.USER])
def read_profile(request: Request, service: Annotated[UserService, Depends()]):
    user_id = request.state.user.get("sub")
    return service.get_user_profile(user_id)

@router.post("/profile")
@with_context
@requires_role([UserRole.USER])
async def update_profile(
    request: Request,
    service: Annotated[UserService, Depends()],
    profile_data: Annotated[Optional[str], Form()] = None,
    file: Annotated[Optional[UploadFile], File()] = None,
):
    user_id = request.state.user.get("sub")
    return await service.update_user_profile_and_resume(user_id, profile_data, file)
