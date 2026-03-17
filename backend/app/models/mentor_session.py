"""MentorSession model."""
import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from app.compat import UUIDType
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class MentorSession(Base):
    __tablename__ = "mentor_sessions"

    id = Column(UUIDType(), primary_key=True, default=uuid.uuid4)
    mentor_id = Column(UUIDType(), ForeignKey("mentors.id"), nullable=False, index=True)
    idea_id = Column(UUIDType(), ForeignKey("startup_ideas.id"), nullable=False, index=True)
    session_date = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=60)
    notes = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    action_items = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)  # 1-5
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    mentor = relationship("Mentor", back_populates="sessions")
    idea = relationship("StartupIdea", back_populates="mentor_sessions")

    def __repr__(self):
        return f"<MentorSession {self.session_date}>"
