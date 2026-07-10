from uuid import UUID
from pydantic import BaseModel

class RequestCreate(BaseModel):
    name: str
    email: str
    mobile_number: str
    description: str

class RequestResponse(BaseModel):
    message: str

from enums.request_status import RequestStatus

class RequestActionInput(BaseModel):
    request_id: UUID
    approve: bool

class RequestDto(BaseModel):
    id: UUID
    name: str
    email: str
    mobile_number: str
    description: str
    status: RequestStatus

    class Config:
        from_attributes = True
