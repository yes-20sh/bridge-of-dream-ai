from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SQLAlchemyEnum
from core.supabase import Base
from enums.request_status import RequestStatus

class RequestModel(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    mobile_number = Column(String(20), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(SQLAlchemyEnum(RequestStatus), default=RequestStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
