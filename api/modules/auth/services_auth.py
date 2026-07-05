from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status, Response
from core.supabase import get_db
from shared.database.model_user import UserModel
from shared.security.password_handler import verify_password
from shared.security.jwt_handler import create_access_token
from .schema_auth import LoginRequest

class AuthService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def signin(self, request_data: LoginRequest, response: Response):
        user = self.db.query(UserModel).filter(UserModel.email == request_data.email).first()
        
        if not user or not verify_password(request_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        token_data = {"sub": str(user.id), "email": user.email}
        
        from datetime import timedelta
        if request_data.remember_me:
            expires_delta = timedelta(days=30)
            cookie_max_age = 30 * 24 * 60 * 60  # 30 days in seconds
        else:
            # Standard expiration if remember_me is False (e.g. 1 day, or session-based)
            expires_delta = timedelta(days=1)
            cookie_max_age = 1 * 24 * 60 * 60  # 1 day in seconds
            
        access_token = create_access_token(data=token_data, expires_delta=expires_delta)
        
        # Set the token in an HttpOnly cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=cookie_max_age,
            samesite="lax",
            secure=False,
            path="/"
        )
        
        return access_token

    def logout(self, response: Response):
        response.delete_cookie(
            key="access_token",
            httponly=True,
            samesite="lax",
            secure=False,
            path="/"
        )

