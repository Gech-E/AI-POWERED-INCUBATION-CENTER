"""StartupIdea schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from enum import Enum


class IdeaStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    EVALUATED = "evaluated"
    INCUBATING = "incubating"
    GRADUATED = "graduated"
    REJECTED = "rejected"


class TeamMember(BaseModel):
    name: str
    role: str
    email: Optional[str] = None


class IdeaCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=300)
    problem_statement: str = Field(..., min_length=20)
    proposed_solution: str = Field(..., min_length=20)
    target_market: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    team_members: Optional[List[TeamMember]] = None
    category: Optional[str] = None


class IdeaUpdate(BaseModel):
    title: Optional[str] = None
    problem_statement: Optional[str] = None
    proposed_solution: Optional[str] = None
    target_market: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    team_members: Optional[List[TeamMember]] = None
    category: Optional[str] = None


class AIEvaluation(BaseModel):
    overall_score: float = Field(..., ge=0, le=100)
    market_potential: float = Field(..., ge=0, le=100)
    technical_feasibility: float = Field(..., ge=0, le=100)
    innovation_level: float = Field(..., ge=0, le=100)
    team_capability: float = Field(..., ge=0, le=100)
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    summary: str


class IdeaResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    problem_statement: str
    proposed_solution: str
    target_market: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    team_members: Optional[List[Dict[str, Any]]] = None
    status: IdeaStatus
    category: Optional[str] = None
    ai_score: Optional[float] = None
    market_potential_score: Optional[float] = None
    technical_feasibility_score: Optional[float] = None
    innovation_score: Optional[float] = None
    team_capability_score: Optional[float] = None
    ai_evaluation: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
