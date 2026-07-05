from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from core.supabase import Base

class ConnectionModel(Base):
    __tablename__ = "linkedin_connections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_linkedin_url = Column(String(500), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    profile = Column(String(10), nullable=False)  # Logo initials (e.g. "AJ")
    job = Column(String(255), nullable=False)      # Job title/designation
    company = Column(String(100), nullable=False, index=True)
    location = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    number = Column(String(50), nullable=False)
    lprofile = Column(String(10), nullable=False)  # connection level like "1st", "2nd", "3rd"
    linkedin_link = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("UserModel")
