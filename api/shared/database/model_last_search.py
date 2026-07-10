import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from datetime import datetime
from core.supabase import Base

class LastSearchModel(Base):
    __tablename__ = "last_searches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False, unique=True)
    keyword = Column(String, nullable=True)
    location = Column(String, nullable=True)
    filters = Column(JSON, default=dict, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
