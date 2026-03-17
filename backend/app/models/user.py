"""User model."""
import uuid
from sqlalchemy import Column, String, Text, Enum as SAEnum, DateTime
from app.compat import UUIDType
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    STUDENT = "student"
    MENTOR = "mentor"
    INVESTOR = "investor"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(UUIDType(), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.STUDENT)
    university = Column(String(200), default="Mekelle University")
    department = Column(String(200), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    startup_ideas = relationship("StartupIdea", back_populates="user", cascade="all, delete-orphan")
    mentor_profile = relationship("Mentor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    investor_profile = relationship("Investor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    partner_profile = relationship("Partner", back_populates="user", uselist=False, cascade="all, delete-orphan")
    matches = relationship("Match", foreign_keys="Match.matched_user_id", back_populates="matched_user")

    def __repr__(self):
        return f"<User {self.full_name} ({self.role})>"
