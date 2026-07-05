from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from datetime import datetime
from core.supabase import Base

class LastSearchModel(Base):
    __tablename__ = "last_searches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False, unique=True)
    keyword = Column(String, nullable=True)
    location = Column(String, nullable=True)
    filters = Column(JSON, default=dict, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
