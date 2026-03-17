"""Match model."""
import uuid
from sqlalchemy import Column, String, Float, Enum as SAEnum, DateTime, ForeignKey
from app.compat import UUIDType
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
import enum


class MatchType(str, enum.Enum):
    MENTOR = "mentor"
    INVESTOR = "investor"
    PARTNER = "partner"


class MatchStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"


class Match(Base):
    __tablename__ = "matches"

    id = Column(UUIDType(), primary_key=True, default=uuid.uuid4)
    idea_id = Column(UUIDType(), ForeignKey("startup_ideas.id"), nullable=False, index=True)
    matched_user_id = Column(UUIDType(), ForeignKey("users.id"), nullable=False, index=True)
    match_type = Column(SAEnum(MatchType), nullable=False)
    match_score = Column(Float, nullable=True)  # AI confidence
    status = Column(SAEnum(MatchStatus), default=MatchStatus.PENDING)
    message = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    idea = relationship("StartupIdea", back_populates="matches")
    matched_user = relationship("User", back_populates="matches")

    def __repr__(self):
        return f"<Match {self.match_type} - {self.status}>"
