"""StartupProgress model."""
import uuid
from sqlalchemy import Column, String, Text, Enum as SAEnum, DateTime, ForeignKey
from app.compat import JSONBType, UUIDType
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
import enum


class StartupStage(str, enum.Enum):
    IDEATION = "ideation"
    VALIDATION = "validation"
    MVP = "mvp"
    GROWTH = "growth"
    SCALE = "scale"


class StartupProgress(Base):
    __tablename__ = "startup_progress"

    id = Column(UUIDType(), primary_key=True, default=uuid.uuid4)
    idea_id = Column(UUIDType(), ForeignKey("startup_ideas.id"), nullable=False, index=True)
    milestone = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    stage = Column(SAEnum(StartupStage), default=StartupStage.IDEATION)
    kpi_data = Column(JSONBType, nullable=True)  # {"users": 100, "revenue": 0, ...}
    is_completed = Column(String(10), default="false")
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    idea = relationship("StartupIdea", back_populates="progress")

    def __repr__(self):
        return f"<Progress {self.milestone} - {self.stage}>"
