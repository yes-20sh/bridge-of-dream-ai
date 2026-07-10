from fastapi import APIRouter, Depends, Request
from typing import Annotated
from decorators.auth_decorators import requires_role
from enums.user_role import UserRole
from decorators.context_decorators import with_context
from .apply_link_schema import ApplyLinkSearchRequest, ApplyLinkSearchResponse, UpdateApplyStatusRequest, UpdateApplyStatusResponse
from .apply_link_service import ApplyLinkService

router = APIRouter(prefix="/apply-links", tags=["Apply Links"])

@router.post("/search", response_model=ApplyLinkSearchResponse)
@with_context
@requires_role([UserRole.USER])
async def search_apply_links(
    request: Request,
    body: ApplyLinkSearchRequest,
    service: Annotated[ApplyLinkService, Depends()]
):
    user_id = request.state.user.get("sub")
    return await service.search_links(user_id, body)

@router.post("/status", response_model=UpdateApplyStatusResponse)
@with_context
@requires_role([UserRole.USER])
def update_apply_status(
    request: Request,
    body: UpdateApplyStatusRequest,
    service: Annotated[ApplyLinkService, Depends()]
):
    user_id = request.state.user.get("sub")
    return service.update_apply_status(user_id, body)
