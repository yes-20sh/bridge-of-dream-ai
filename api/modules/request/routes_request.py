from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, status, Response, Request
from fastapi.responses import HTMLResponse
from shared.pagination.pagination_schema import PaginationParams, PaginatedResponse
from .schema_request import RequestCreate, RequestResponse, RequestDto
from .services_request import RequestService
from .schema_request import RequestActionInput
from decorators.auth_decorators import public, requires_role
from enums.user_role import UserRole

router = APIRouter(prefix="/requests", tags=["Requests"])

@router.post("/create-request", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
@public
def submit_request(request_data: RequestCreate, response: Response, service: Annotated[RequestService, Depends()]):
    return service.create_request(request_data, response)

@router.get("/all-request", response_model=PaginatedResponse[RequestDto], status_code=status.HTTP_200_OK)
@requires_role([UserRole.ADMIN])
def get_requests(request: Request, params: Annotated[PaginationParams, Depends()], service: Annotated[RequestService, Depends()]):
    return service.get_requests(params)


@router.post("/action", response_model=RequestResponse, status_code=status.HTTP_200_OK)
@public
def process_request_action(action_input: RequestActionInput, service: Annotated[RequestService, Depends()]):
    return service.process_request_action(action_input)

@router.get("/email-action", response_class=HTMLResponse, status_code=status.HTTP_200_OK)
@public
def process_request_email_action(request_id: UUID, approve: bool, service: Annotated[RequestService, Depends()]):
    action_input = RequestActionInput(request_id=request_id, approve=approve)
    html_content = service.process_request_email_action(action_input)
    return HTMLResponse(content=html_content)
