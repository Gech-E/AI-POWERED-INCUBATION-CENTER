"""Mentor and Match schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from enum import Enum


class MentorCreate(BaseModel):
    expertise: List[str]
    industries: Optional[List[str]] = None
    years_experience: Optional[int] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    max_mentees: int = 5
    bio: Optional[str] = None


class MentorResponse(BaseModel):
    id: UUID
    user_id: UUID
    expertise: Optional[List[str]] = None
    industries: Optional[List[str]] = None
    years_experience: Optional[int] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    availability: str
    max_mentees: int
    current_mentees: int
    rating: float
    total_sessions: int
    bio: Optional[str] = None
    # Joined user info
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class MatchType(str, Enum):
    MENTOR = "mentor"
    INVESTOR = "investor"
    PARTNER = "partner"


class MatchRequest(BaseModel):
    idea_id: UUID
    matched_user_id: UUID
    match_type: MatchType
    message: Optional[str] = None


class MatchResponse(BaseModel):
    id: UUID
    idea_id: UUID
    matched_user_id: UUID
    match_type: str
    match_score: Optional[float] = None
    status: str
    message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MilestoneCreate(BaseModel):
    idea_id: UUID
    milestone: str = Field(..., min_length=3, max_length=300)
    description: Optional[str] = None
    stage: Optional[str] = "ideation"


class MilestoneResponse(BaseModel):
    id: UUID
    idea_id: UUID
    milestone: str
    description: Optional[str] = None
    stage: str
    kpi_data: Optional[dict] = None
    is_completed: str
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MilestoneUpdate(BaseModel):
    milestone: Optional[str] = Field(None, min_length=3, max_length=300)
    description: Optional[str] = None
    stage: Optional[str] = None
    kpi_data: Optional[dict] = None


class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1)
    idea_id: Optional[UUID] = None


class ChatResponse(BaseModel):
    reply: str
    suggestions: Optional[List[str]] = None


class DashboardStats(BaseModel):
    total_ideas: int
    evaluated_ideas: int
    incubating_ideas: int
    total_mentors: int
    total_investors: int
    total_matches: int
    avg_ai_score: Optional[float] = None
    recent_ideas: List[dict] = []
