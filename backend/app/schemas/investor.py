"""Investor schemas for request/response validation."""
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID


class InvestorCreate(BaseModel):
    investment_focus: List[str]
    min_investment: Optional[float] = None
    max_investment: Optional[float] = None
    fund_name: Optional[str] = None
    website: Optional[str] = None
    preferred_stage: Optional[str] = None
    bio: Optional[str] = None


class InvestorResponse(BaseModel):
    id: UUID
    user_id: UUID
    investment_focus: Optional[List[str]] = None
    min_investment: Optional[float] = None
    max_investment: Optional[float] = None
    portfolio_count: int = 0
    fund_name: Optional[str] = None
    website: Optional[str] = None
    preferred_stage: Optional[str] = None
    bio: Optional[str] = None
    # Joined user info
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True
