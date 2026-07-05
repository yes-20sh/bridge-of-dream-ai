from sqlalchemy.orm import Session
from fastapi import Depends
from core.supabase import get_db
from shared.database.model_connection import ConnectionModel
from shared.database.model_job_applied import JobAppliedModel
from shared.database.model_saved_job import SavedJobModel
from .general_schema import HeaderMetricsResponse

class GeneralService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def get_header_metrics(self, user_id: int) -> HeaderMetricsResponse:
        network_count = self.db.query(ConnectionModel).filter(ConnectionModel.user_id == user_id).count()
        applied_count = self.db.query(JobAppliedModel).filter(JobAppliedModel.user_id == user_id).count()
        saved_count = self.db.query(SavedJobModel).filter(SavedJobModel.user_id == user_id).count()

        return HeaderMetricsResponse(
            network=network_count,
            applied=applied_count,
            saved=saved_count
        )
