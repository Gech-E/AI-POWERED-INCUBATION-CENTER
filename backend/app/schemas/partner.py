"""Partner schemas."""

from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel


class PartnerResponse(BaseModel):
    id: UUID
    user_id: UUID
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

    organization: Optional[str] = None
    job_title: Optional[str] = None
    partnership_types: Optional[List[str]] = None
    industries: Optional[List[str]] = None
    capabilities: Optional[List[str]] = None
    preferred_stage: Optional[str] = None
    years_experience: Optional[int] = None
    website: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True

