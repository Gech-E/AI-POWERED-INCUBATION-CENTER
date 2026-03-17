"""Networking router — AI matchmaking and match management."""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.matching_service import (
    create_match, get_matches_for_user, get_matches_for_idea, update_match_status,
)
from app.services.idea_service import get_idea_for_user
from app.ai.recommender import recommend_mentors, recommend_investors, recommend_partners
from app.middleware.auth_middleware import get_authenticated_user
from app.schemas.mentor import MatchRequest, MatchResponse

router = APIRouter()


@router.get("/matches")
def my_matches(
    match_type: Optional[str] = None,
    user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """Get all matches for the current user."""
    matches = get_matches_for_user(db, user.id, match_type)
    return [MatchResponse.model_validate(m) for m in matches]


@router.get("/matches/idea/{idea_id}")
def idea_matches(idea_id: UUID, db: Session = Depends(get_db), user=Depends(get_authenticated_user)):
    """Get all matches for a specific idea."""
    _ = get_idea_for_user(db, idea_id, user)
    matches = get_matches_for_idea(db, idea_id)
    return [MatchResponse.model_validate(m) for m in matches]


@router.post("/recommend/mentors/{idea_id}")
def get_mentor_recommendations(
    idea_id: UUID,
    user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """AI-powered mentor recommendations for a startup idea."""
    idea = get_idea_for_user(db, idea_id, user)
    return recommend_mentors(db, idea)


@router.post("/recommend/investors/{idea_id}")
def get_investor_recommendations(
    idea_id: UUID,
    user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """AI-powered investor recommendations for a startup idea."""
    idea = get_idea_for_user(db, idea_id, user)
    return recommend_investors(db, idea)


@router.post("/recommend/partners/{idea_id}")
def get_partner_recommendations(
    idea_id: UUID,
    user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """AI-powered partner recommendations for a startup idea."""
    idea = get_idea_for_user(db, idea_id, user)
    return recommend_partners(db, idea)


@router.post("/match", response_model=MatchResponse)
def request_match(
    data: MatchRequest,
    user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """Request a mentor/investor/partner match."""
    match = create_match(
        db,
        idea_id=data.idea_id,
        matched_user_id=data.matched_user_id,
        match_type=data.match_type.value,
        message=data.message,
    )
    return MatchResponse.model_validate(match)


@router.put("/match/{match_id}/status")
def respond_to_match(
    match_id: UUID,
    new_status: str,
    user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """Accept or decline a match request."""
    match = update_match_status(db, match_id, user.id, new_status)
    return MatchResponse.model_validate(match)
