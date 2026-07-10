from datetime import datetime, timedelta, timezone
import secrets
import string
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, Response, status
from core.supabase import get_db
from shared.database.model_request import RequestModel
from .schema_request import RequestCreate
from enums.request_status import RequestStatus
from shared.pagination.pagination_schema import PaginationParams, PaginatedResponse
from shared.pagination.pagination_service import paginate_query
from .schema_request import RequestDto
from shared.security.password_handler import get_password_hash
from shared.mail.mail_service import MailTemplate
from shared.database.model_user import UserModel
import os
from shared.utils.html_templates import get_action_response_html

class RequestService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def create_request(self, request_data: RequestCreate, response: Response):
        try:
            twenty_four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=24)
            existing_request = self.db.query(RequestModel).filter(
                RequestModel.email == request_data.email,
                RequestModel.created_at >= twenty_four_hours_ago
            ).first()
            if existing_request:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="you already requested wait for 24 hr"
                )

            db_request = RequestModel(
                name=request_data.name,
                email=request_data.email,
                mobile_number=request_data.mobile_number,
                description=request_data.description,
                status=RequestStatus.PENDING
            )
            self.db.add(db_request)
            self.db.commit()
            self.db.refresh(db_request)
            
            # Send email to admin for approval
            admin_email = os.getenv("ADMIN_EMAIL", "admin@admin.com")
            try:
                MailTemplate.send_admin_request_approval_email(
                    admin_email=admin_email,
                    request_id=str(db_request.id),
                    name=db_request.name,
                    email=db_request.email,
                    mobile_number=db_request.mobile_number,
                    description=db_request.description
                )
            except Exception as e:
                pass
                
            response.status_code = status.HTTP_201_CREATED
            return {"message": "Request successfully saved"}
        except HTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred while saving: {str(e)}")

    def get_requests(self, params: PaginationParams) -> PaginatedResponse[RequestDto]:
        try:
            query = self.db.query(RequestModel).order_by(RequestModel.created_at.desc())
            return paginate_query(query, params)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred while fetching: {str(e)}")

    def process_request_action(self, action_input):
        try:
            db_request = self.db.query(RequestModel).filter(RequestModel.id == action_input.request_id).first()
            if not db_request:
                raise HTTPException(status_code=404, detail="Request not found")

            if action_input.approve:
                db_request.status = RequestStatus.APPROVE
                
                # Check if user already exists
                existing_user = self.db.query(UserModel).filter(UserModel.email == db_request.email).first()
                if not existing_user:
                    first_name = db_request.name.split()[0].capitalize() if db_request.name else "User"
                    random_digits = "".join(secrets.choice(string.digits) for _ in range(4))
                    plain_text = f"{first_name}{random_digits}"
                    hashed_pwd = get_password_hash(plain_text)
                    new_user = UserModel(
                        name=db_request.name,
                        email=db_request.email,
                        mobile=db_request.mobile_number,
                        hashed_password=hashed_pwd
                    )
                    self.db.add(new_user)
                    self.db.flush()
                else:
                    message = "You already have an account"
                    plain_text = message
                
                # Send email
                MailTemplate.send_approval_email(to_email=db_request.email, name=db_request.name, password=plain_text)
                message = "Request approved and email sent."
            else:
                db_request.status = RequestStatus.REJECT
                MailTemplate.send_rejection_email(to_email=db_request.email, name=db_request.name)
                message = "Request rejected and email sent."
                
            self.db.commit()
            return {"message": message}
            
        except HTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred during processing: {str(e)}")

    def process_request_email_action(self, action_input) -> str:
        try:
            result = self.process_request_action(action_input)
            message = result.get("message", "Action processed successfully.")
            status_text = "Success"
            status_icon = "✓"
            status_color = "#22c55e" 
        except Exception as e:
            message = str(e)
            status_text = "Error"
            status_icon = "✗"
            status_color = "#ef4444"
            
        html_content = get_action_response_html(
            status_color=status_color,
            status_icon=status_icon,
            status_text=status_text,
            message=message
        )
        return html_content
