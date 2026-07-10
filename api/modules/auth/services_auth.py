from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status, Response
from core.supabase import get_db
from shared.database.model_user import UserModel
from shared.security.password_handler import verify_password
from shared.security.jwt_handler import create_access_token
from .schema_auth import LoginRequest, ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest
from datetime import datetime, timedelta, timezone
import secrets
import string
from shared.database.model_otp import OtpModel
from shared.mail.mail_service import MailTemplate
from shared.security.password_handler import get_password_hash
import os
from shared.database.model_admin import AdminModel
from enums.user_role import UserRole

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
        
  
        is_production = os.getenv("ENVIRONMENT") == "production"
        
        # Set the token in an HttpOnly cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=cookie_max_age,
            samesite="none" if is_production else "lax",
            secure=is_production,
            path="/"
        )
        
        return access_token

    def logout(self, response: Response):
        import os
        is_production = os.getenv("ENVIRONMENT") == "production"
        response.delete_cookie(
            key="access_token",
            httponly=True,
            samesite="none" if is_production else "lax",
            secure=is_production,
            path="/"
        )

    def forgot_password(self, request_data: ForgotPasswordRequest):
        user = self.db.query(UserModel).filter(UserModel.email == request_data.email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="This email is not registered."
            )
        
        otp_code = ''.join(secrets.choice(string.digits) for _ in range(6))
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        
        self.db.query(OtpModel).filter(OtpModel.email == request_data.email).delete()
        
        new_otp = OtpModel(email=request_data.email, otp=otp_code, expires_at=expires_at)
        self.db.add(new_otp)
        self.db.commit()
        
        try:
            MailTemplate.send_password_reset_otp_email(to_email=request_data.email, name=user.name, otp_code=otp_code)
        except Exception:
            pass # Handle or log email failure
            
        return {"message": "OTP has been sent.", "code": 200}

    def verify_otp(self, request_data: VerifyOtpRequest):
        otp_record = self.db.query(OtpModel).filter(
            OtpModel.email == request_data.email,
            OtpModel.otp == request_data.otp
        ).first()
        
        if not otp_record or otp_record.expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )
            
        return {"message": "OTP verified successfully", "code": 200}

    def reset_password(self, request_data: ResetPasswordRequest):
        if request_data.new_password != request_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )
            
        otp_record = self.db.query(OtpModel).filter(
            OtpModel.email == request_data.email,
            OtpModel.otp == request_data.otp
        ).first()
        
        if not otp_record or otp_record.expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )
            
        user = self.db.query(UserModel).filter(UserModel.email == request_data.email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        user.hashed_password = get_password_hash(request_data.new_password)
        self.db.delete(otp_record)
        self.db.commit()
        
        return {"message": "Password has been reset successfully", "code": 200}

    @staticmethod
    def create_admin_from_env(db: Session) -> dict:
        import os
        admin_name = os.getenv("ADMIN_NAME")
        admin_email = os.getenv("ADMIN_EMAIL")
        admin_password = os.getenv("ADMIN_PASSWORD")
        
        if not admin_name or not admin_email or not admin_password:
            return {"message": "Admin environment variables not fully set. Skipping creation.", "code": 400}
            
        existing_admin = db.query(AdminModel).filter(AdminModel.email == admin_email).first()
        if existing_admin:
            return {"message": f"Admin with email {admin_email} already exists.", "code": 200, "skipped": True}
            
        hashed_pwd = get_password_hash(admin_password)
        new_admin = AdminModel(
            name=admin_name,
            email=admin_email,
            hashed_password=hashed_pwd,
            role=UserRole.ADMIN
        )
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        return {"message": f"Admin user {admin_name} created successfully.", "code": 201, "admin_id": str(new_admin.id)}
