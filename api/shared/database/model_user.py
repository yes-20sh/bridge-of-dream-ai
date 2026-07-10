import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, Integer, String, DateTime, JSON, Enum as SQLAlchemyEnum
from datetime import datetime
from core.supabase import Base
from enums.user_role import UserRole

class UserModel(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    mobile = Column(String, nullable=True)
    role = Column(SQLAlchemyEnum(UserRole), default=UserRole.USER, nullable=False)
    job_roles = Column(JSON, default=list, nullable=True)
    job_types = Column(JSON, default=list, nullable=True)
    locations = Column(JSON, default=list, nullable=True)
    companies = Column(JSON, default=list, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
