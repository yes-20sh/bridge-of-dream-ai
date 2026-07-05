from fastapi import APIRouter, Depends, Response, status, Request
from typing import Annotated
from .schema_auth import LoginRequest
from .services_auth import AuthService
from core.rate_limit import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signin", status_code=status.HTTP_200_OK)
@limiter.limit("5/minute")
def signin(request: Request, login_data: LoginRequest, response: Response, service: Annotated[AuthService, Depends()]):
    access_token = service.signin(login_data, response)
    return {"message": "Successfully signed in", "code": 200, "access_token": access_token}

@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(response: Response, service: Annotated[AuthService, Depends()]):
    service.logout(response)
    return {"message": "Successfully logged out", "code": 200}
