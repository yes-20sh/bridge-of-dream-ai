import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, DateTime, Enum as SQLAlchemyEnum
from datetime import datetime
from core.supabase import Base
from enums.user_role import UserRole

class AdminModel(Base):
    __tablename__ = "admins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLAlchemyEnum(UserRole), default=UserRole.ADMIN, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
