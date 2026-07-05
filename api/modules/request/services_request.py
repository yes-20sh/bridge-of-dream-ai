from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, Response, status
from core.supabase import get_db
from shared.database.model_request import RequestModel
from .schema_request import RequestCreate
from enums.request_status import RequestStatus
from shared.pagination.pagination_schema import PaginationParams, PaginatedResponse
from shared.pagination.pagination_service import paginate_query
from .schema_request import RequestDto
from shared.security.password_handler import generate_random_password, get_password_hash
from shared.security.jwt_handler import create_access_token
from shared.mail.mail_service import send_approval_email, send_rejection_email
from shared.database.model_user import UserModel

class RequestService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def create_request(self, request_data: RequestCreate, response: Response):
        try:
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
            response.status_code = status.HTTP_201_CREATED
            return {"message": "Request successfully saved"}
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
                    password = generate_random_password()
                    hashed_pwd = get_password_hash(password)
                    new_user = UserModel(
                        name=db_request.name,
                        email=db_request.email,
                        mobile=db_request.mobile_number,
                        hashed_password=hashed_pwd
                    )
                    self.db.add(new_user)
                    self.db.flush()
                    user_id = new_user.id
                else:
                    message = "You already have an account"
                    password = message
                    user_id = existing_user.id
                
                # Generate JWT
                jwt_token = create_access_token(data={"sub": str(user_id), "email": db_request.email})
                
                # Send email
                send_approval_email(to_email=db_request.email, name=db_request.name, password=password, jwt_token=jwt_token)
                message = "Request approved and email sent."
            else:
                db_request.status = RequestStatus.REJECT
                send_rejection_email(to_email=db_request.email, name=db_request.name)
                message = "Request rejected and email sent."
                
            self.db.commit()
            return {"message": message}
            
        except HTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"An error occurred during processing: {str(e)}")
