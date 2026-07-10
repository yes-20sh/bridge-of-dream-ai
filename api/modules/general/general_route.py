from fastapi import APIRouter, Depends, Request
from typing import Annotated
from decorators.auth_decorators import requires_role
from enums.user_role import UserRole
from decorators.context_decorators import with_context
from .general_schema import HeaderMetricsResponse
from .general_service import GeneralService

router = APIRouter(prefix="/general", tags=["general"])

@router.get("/metrics", response_model=HeaderMetricsResponse)
@with_context
@requires_role([UserRole.USER])
def get_header_metrics(request: Request, service: Annotated[GeneralService, Depends()]):
    user_id = request.state.user.get("sub")
    return service.get_header_metrics(user_id)

@router.get("/cron", status_code=200)
def cron_ping():
    return {"status": "ok"}
