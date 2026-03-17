"""Mentor session schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class MentorSessionCreate(BaseModel):
    mentor_id: UUID
    idea_id: UUID
    session_date: datetime
    duration_minutes: int = Field(60, ge=15, le=240)
    notes: Optional[str] = None


class MentorSessionResponse(BaseModel):
    id: UUID
    mentor_id: UUID
    idea_id: UUID
    session_date: datetime
    duration_minutes: int
    notes: Optional[str] = None
    feedback: Optional[str] = None
    rating: Optional[int] = None
    mentor_name: Optional[str] = None

    class Config:
        from_attributes = True

