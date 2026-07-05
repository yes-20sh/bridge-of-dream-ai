from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from core.supabase import get_db
from shared.database.model_saved_job import SavedJobModel
from .schema_save_jobs import SavedJobCreate, SavedJobDto
from shared.pagination.pagination_schema import PaginationParams, PaginatedResponse
from shared.pagination.pagination_service import paginate_query

class SaveJobService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def save_job(self, user_id: int, job_data: SavedJobCreate):
        try:
            existing = self.db.query(SavedJobModel).filter(
                SavedJobModel.user_id == user_id,
                SavedJobModel.job_id == job_data.job_id
            ).first()

            if existing:
                self.db.delete(existing)
                self.db.commit()
                return {"message": "Job unsaved successfully"}
            
            db_job = SavedJobModel(
                user_id=user_id,
                job_id=job_data.job_id,
                description=job_data.description,
                logo=job_data.logo,
                job_type=job_data.job_type,
                location=job_data.location,
                date=job_data.date,
                job_title=job_data.job_title,
                company_name=job_data.company_name
            )
            self.db.add(db_job)
            self.db.commit()
            return {"message": "Job saved successfully"}
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred while saving the job: {str(e)}"
            )

    def get_saved_jobs(self, user_id: int, params: PaginationParams) -> PaginatedResponse[SavedJobDto]:
        try:
            query = self.db.query(SavedJobModel).filter(
                SavedJobModel.user_id == user_id
            ).order_by(SavedJobModel.created_at.desc())
            
            return paginate_query(query, params)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred while fetching saved jobs: {str(e)}"
            )
