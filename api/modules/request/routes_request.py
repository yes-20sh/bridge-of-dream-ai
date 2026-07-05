from typing import Annotated
from fastapi import APIRouter, Depends, status, Response
from shared.pagination.pagination_schema import PaginationParams, PaginatedResponse
from .schema_request import RequestCreate, RequestResponse, RequestDto
from .services_request import RequestService
from .schema_request import RequestActionInput


router = APIRouter(prefix="/requests", tags=["Requests"])

@router.post("/create-request", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
def submit_request(request_data: RequestCreate, response: Response, service: Annotated[RequestService, Depends()]):
    return service.create_request(request_data, response)

@router.get("/all-request", response_model=PaginatedResponse[RequestDto], status_code=status.HTTP_200_OK)
def get_requests(params: Annotated[PaginationParams, Depends()], service: Annotated[RequestService, Depends()]):
    return service.get_requests(params)


@router.post("/action", response_model=RequestResponse, status_code=status.HTTP_200_OK)
def process_request_action(action_input: RequestActionInput, service: Annotated[RequestService, Depends()]):
    return service.process_request_action(action_input)
