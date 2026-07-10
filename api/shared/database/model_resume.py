import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from core.supabase import Base

class ResumeModel(Base):
    __tablename__ = "resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    cloudinary_url = Column(String, nullable=False)
    extracted_data = Column(JSON, nullable=True)  # Stores parsed resume info
    created_at = Column(DateTime, default=datetime.utcnow)

 
