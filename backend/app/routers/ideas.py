"""Startup Ideas router — CRUD + AI evaluation."""
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.startup_idea import IdeaCreate, IdeaUpdate, IdeaResponse
from app.services.idea_service import (
    create_idea, get_ideas, get_idea_for_user, update_idea, delete_idea, save_evaluation,
)
from app.ai.idea_evaluator import evaluate_idea
from app.middleware.auth_middleware import get_authenticated_user

router = APIRouter()


@router.post("/", response_model=IdeaResponse, status_code=201)
async def submit_idea(
    idea_data: IdeaCreate,
    user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """Submit a new startup idea."""
    return create_idea(db, user, idea_data)


@router.get("/", response_model=List[IdeaResponse])
def list_ideas(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """List startup ideas. Students see only their own; others see all."""
    return get_ideas(db, user=user, status=status, skip=skip, limit=limit)


@router.get("/{idea_id}", response_model=IdeaResponse)
def get_idea(idea_id: UUID, db: Session = Depends(get_db), user=Depends(get_authenticated_user)):
    """Get a specific startup idea by ID."""
    return get_idea_for_user(db, idea_id, user)


@router.put("/{idea_id}", response_model=IdeaResponse)
def edit_idea(
    idea_id: UUID,
    idea_data: IdeaUpdate,
    user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """Update an existing startup idea."""
    return update_idea(db, idea_id, user, idea_data)


@router.delete("/{idea_id}")
def remove_idea(idea_id: UUID, user=Depends(get_authenticated_user), db: Session = Depends(get_db)):
    """Delete a startup idea."""
    delete_idea(db, idea_id, user)
    return {"detail": "Idea deleted successfully"}


@router.post("/{idea_id}/evaluate", response_model=IdeaResponse)
async def evaluate_startup_idea(
    idea_id: UUID,
    user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """Trigger AI evaluation on a startup idea."""
    idea = get_idea_for_user(db, idea_id, user)
    idea_data = {
        "title": idea.title,
        "problem_statement": idea.problem_statement,
        "proposed_solution": idea.proposed_solution,
        "target_market": idea.target_market or "",
        "tech_stack": idea.tech_stack or [],
        "team_members": idea.team_members or [],
    }
    evaluation = await evaluate_idea(idea_data)
    updated = save_evaluation(db, idea_id, evaluation)
    return updated
