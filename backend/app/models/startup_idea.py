"""StartupIdea model."""
import uuid
from sqlalchemy import Column, String, Text, Float, Enum as SAEnum, DateTime, ForeignKey
from app.compat import ArrayType, JSONBType, UUIDType
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
import enum


class IdeaStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    EVALUATED = "evaluated"
    INCUBATING = "incubating"
    GRADUATED = "graduated"
    REJECTED = "rejected"


class StartupIdea(Base):
    __tablename__ = "startup_ideas"

    id = Column(UUIDType(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUIDType(), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(300), nullable=False)
    problem_statement = Column(Text, nullable=False)
    proposed_solution = Column(Text, nullable=False)
    target_market = Column(Text, nullable=True)
    tech_stack = Column(ArrayType, nullable=True)
    team_members = Column(JSONBType, nullable=True)  # [{name, role, email}]
    status = Column(SAEnum(IdeaStatus), default=IdeaStatus.DRAFT, index=True)
    category = Column(String(100), nullable=True)  # e.g., "FinTech", "AgriTech"

    # AI evaluation results
    ai_score = Column(Float, nullable=True)
    market_potential_score = Column(Float, nullable=True)
    technical_feasibility_score = Column(Float, nullable=True)
    innovation_score = Column(Float, nullable=True)
    team_capability_score = Column(Float, nullable=True)
    ai_evaluation = Column(JSONBType, nullable=True)  # Full AI analysis output

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="startup_ideas")
    matches = relationship("Match", back_populates="idea", cascade="all, delete-orphan")
    progress = relationship("StartupProgress", back_populates="idea", cascade="all, delete-orphan")
    mentor_sessions = relationship("MentorSession", back_populates="idea", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<StartupIdea {self.title} - {self.status}>"
