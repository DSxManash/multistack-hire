import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
import enum

#  enum defines the allowed role values and ensures type safety
class UserRole(str, enum.Enum):
    admin = "admin"
    recruiter = "recruiter"
    candidate = "candidate"

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String, 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )

    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    
    email: Mapped[str] = mapped_column(
        String(255), 
        unique=True,      
        nullable=False, 
        index=True       
    )

    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole), 
        nullable=False,
        default=UserRole.candidate  
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

   
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow    
    )

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"