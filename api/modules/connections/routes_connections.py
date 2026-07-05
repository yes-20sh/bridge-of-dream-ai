from typing import Annotated
from fastapi import APIRouter, Depends, status, Request
from decorators.auth_decorators import user
from decorators.context_decorators import with_context
from shared.pagination.pagination_schema import PaginationParams, PaginatedResponse
from .schema_connections import ConnectionDto, ConnectionCreate, ConnectionResponse
from .services_connections import ConnectionsService

router = APIRouter(prefix="/connections", tags=["Connections"])

@router.get("", response_model=PaginatedResponse[ConnectionDto], status_code=status.HTTP_200_OK)
def get_linkedin_connections(
    company: str,
    params: Annotated[PaginationParams, Depends()],
    service: Annotated[ConnectionsService, Depends()]
):
    return service.get_connections("https://www.linkedin.com/in/yes20sh/", company, params)

@router.post("/save", response_model=ConnectionResponse, status_code=status.HTTP_200_OK)
@with_context
@user
def save_connection(
    request: Request,
    body: ConnectionCreate,
    service: Annotated[ConnectionsService, Depends()]
):
    user_id = int(request.state.user.get("sub"))
    return service.save_connection(user_id=user_id, connection_data=body)

@router.get("/all", response_model=PaginatedResponse[ConnectionDto], status_code=status.HTTP_200_OK)
@with_context
@user
def get_all_saved_connections(
    request: Request,
    params: Annotated[PaginationParams, Depends()],
    service: Annotated[ConnectionsService, Depends()]
):
    user_id = int(request.state.user.get("sub"))
    return service.get_saved_connections(user_id=user_id, params=params)

@router.get("/company", response_model=PaginatedResponse[ConnectionDto], status_code=status.HTTP_200_OK)
@with_context
@user
def get_saved_connections_by_company(
    request: Request,
    company: str,
    params: Annotated[PaginationParams, Depends()],
    service: Annotated[ConnectionsService, Depends()]
):
    user_id = int(request.state.user.get("sub"))
    return service.get_saved_connections_by_company(user_id=user_id, company=company, params=params)
