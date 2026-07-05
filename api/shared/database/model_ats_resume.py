from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from core.supabase import Base

class AtsResumeModel(Base):
    __tablename__ = "ats_resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(String, nullable=False, index=True)
    job_description = Column(String, nullable=True) # Optional context text
    
    # Store the copied resume info
    cloudinary_url = Column(String, nullable=False)
    extracted_data = Column(JSON, nullable=True) 

    # Store the complex structured JSON from the LLM here
    # Example format: [{"keyword": "Python", "priority": "high", "weightage": 20, "is_matching": True, "old_sentence": None, "new_sentence": None}]
    analysis_data = Column(JSONB, nullable=False, default=list)

    # Store application statuses for multiple portals/links
    # Example format: [{"platform": "LinkedIn", "url": "...", "status": "applied"}]
    apply_statuses = Column(JSONB, nullable=True, default=list)

    user = relationship("UserModel")
    job_applied = relationship("JobAppliedModel", back_populates="ats_resume", uselist=False)
