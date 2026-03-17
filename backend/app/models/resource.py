"""Resource model."""
import uuid
from sqlalchemy import Column, String, Text, Enum as SAEnum, DateTime
from app.compat import ArrayType, UUIDType
from datetime import datetime, timezone
from app.database import Base
import enum


class ResourceType(str, enum.Enum):
    WORKSHOP = "workshop"
    FUNDING = "funding"
    INCUBATOR = "incubator"
    TOOL = "tool"
    COURSE = "course"
    EVENT = "event"


class Resource(Base):
    __tablename__ = "resources"

    id = Column(UUIDType(), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    type = Column(SAEnum(ResourceType), nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String(500), nullable=True)
    provider = Column(String(200), nullable=True)
    relevance_tags = Column(ArrayType, nullable=True)  # For AI matching
    is_active = Column(String(10), default="true")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Resource {self.title} ({self.type})>"
