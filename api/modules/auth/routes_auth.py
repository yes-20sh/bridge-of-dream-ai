from fastapi import APIRouter, Depends, Response, status, Request
from typing import Annotated
from sqlalchemy.orm import Session
from core.supabase import get_db
from .schema_auth import LoginRequest, ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest
from .services_auth import AuthService
from core.rate_limit import limiter
from decorators.auth_decorators import public

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signin", status_code=status.HTTP_200_OK)
@limiter.limit("5/minute")
@public
def signin(request: Request, login_data: LoginRequest, response: Response, service: Annotated[AuthService, Depends()]):
    access_token = service.signin(login_data, response)
    return {"message": "Successfully signed in", "code": 200, "access_token": access_token}

@router.post("/logout", status_code=status.HTTP_200_OK)
@public
def logout(response: Response, service: Annotated[AuthService, Depends()]):
    service.logout(response)
    return {"message": "Successfully logged out", "code": 200}

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
@limiter.limit("3/minute")
@public
def forgot_password(request: Request, data: ForgotPasswordRequest, service: Annotated[AuthService, Depends()]):
    return service.forgot_password(data)

@router.post("/verify-otp", status_code=status.HTTP_200_OK)
@limiter.limit("5/minute")
@public
def verify_otp(request: Request, data: VerifyOtpRequest, service: Annotated[AuthService, Depends()]):
    return service.verify_otp(data)

@router.post("/reset-password", status_code=status.HTTP_200_OK)
@limiter.limit("3/minute")
@public
def reset_password(request: Request, data: ResetPasswordRequest, service: Annotated[AuthService, Depends()]):
    return service.reset_password(data)

@router.post("/create-admin", status_code=status.HTTP_200_OK)
@public
def create_admin(db: Annotated[Session, Depends(get_db)], service: Annotated[AuthService, Depends()]):
    return service.create_admin_from_env(db)
