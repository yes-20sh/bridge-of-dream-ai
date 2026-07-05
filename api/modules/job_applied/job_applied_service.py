from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from shared.database.model_job_applied import JobAppliedModel
from core.supabase import get_db

class JobAppliedService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def save_job_applied(self, user_id: int, request_data):
        # Check if it already exists
        existing_job = self.db.query(JobAppliedModel).filter(
            JobAppliedModel.user_id == user_id,
            JobAppliedModel.job_id == request_data.job_id
        ).first()

        if existing_job:
            # Update
            existing_job.job_title = request_data.job_title
            existing_job.company_name = request_data.company_name
            existing_job.company_logo = request_data.company_logo
            existing_job.job_description = request_data.job_description
            existing_job.job_type = request_data.job_type
            existing_job.location = request_data.location
            existing_job.apply_status = request_data.apply_status
            if request_data.ats_resume_id:
                existing_job.ats_resume_id = request_data.ats_resume_id
        else:
            # Create new
            existing_job = JobAppliedModel(
                user_id=user_id,
                job_id=request_data.job_id,
                job_title=request_data.job_title,
                company_name=request_data.company_name,
                company_logo=request_data.company_logo,
                job_description=request_data.job_description,
                job_type=request_data.job_type,
                location=request_data.location,
                apply_status=request_data.apply_status,
                ats_resume_id=request_data.ats_resume_id
            )
            self.db.add(existing_job)
        
        self.db.commit()
        self.db.refresh(existing_job)
        return existing_job

    def get_applied_jobs(self, user_id: int):
        jobs = self.db.query(JobAppliedModel).filter(
            JobAppliedModel.user_id == user_id
        ).order_by(JobAppliedModel.id.desc()).all()
        return jobs

    def get_applied_job_details(self, user_id: int, job_id: str):
        job = self.db.query(JobAppliedModel).filter(
            JobAppliedModel.user_id == user_id,
            JobAppliedModel.job_id == job_id
        ).first()
        if not job:
            raise HTTPException(status_code=404, detail="Applied job not found")
        return job
