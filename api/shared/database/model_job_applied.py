from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from core.supabase import Base

class JobAppliedModel(Base):
    __tablename__ = "job_applied"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(String, nullable=False, index=True)
    job_title = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    company_logo = Column(String, nullable=True)
    job_description = Column(String, nullable=True)
    job_type = Column(String, nullable=True)
    location = Column(String, nullable=True)
    apply_status = Column(String, nullable=False, default="process")
    ats_resume_id = Column(Integer, ForeignKey("ats_resumes.id", ondelete="SET NULL"), nullable=True)

    user = relationship("UserModel")
    ats_resume = relationship("AtsResumeModel", back_populates="job_applied")
