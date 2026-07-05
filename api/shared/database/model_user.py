from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from core.supabase import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    mobile = Column(String, nullable=True)
    job_roles = Column(JSON, default=list, nullable=True)
    job_types = Column(JSON, default=list, nullable=True)
    locations = Column(JSON, default=list, nullable=True)
    companies = Column(JSON, default=list, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
