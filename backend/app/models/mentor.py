"""Mentor model."""
import uuid
from sqlalchemy import Column, String, Integer, Float, Text, Enum as SAEnum, ForeignKey
from app.compat import ArrayType, UUIDType
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class Availability(str, enum.Enum):
    AVAILABLE = "available"
    BUSY = "busy"
    UNAVAILABLE = "unavailable"


class Mentor(Base):
    __tablename__ = "mentors"

    id = Column(UUIDType(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUIDType(), ForeignKey("users.id"), unique=True, nullable=False)
    expertise = Column(ArrayType, nullable=True)  # ["AI/ML", "FinTech", "Marketing"]
    industries = Column(ArrayType, nullable=True)
    years_experience = Column(Integer, nullable=True)
    company = Column(String(200), nullable=True)
    job_title = Column(String(200), nullable=True)
    availability = Column(SAEnum(Availability), default=Availability.AVAILABLE)
    max_mentees = Column(Integer, default=5)
    current_mentees = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    total_sessions = Column(Integer, default=0)
    bio = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="mentor_profile")
    sessions = relationship("MentorSession", back_populates="mentor", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Mentor {self.user_id} - {self.expertise}>"
