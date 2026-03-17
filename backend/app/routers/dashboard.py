"""Dashboard router — stats, milestones, progress tracking."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models.startup_progress import StartupProgress, StartupStage
from app.schemas.mentor import MilestoneCreate, MilestoneResponse, MilestoneUpdate, DashboardStats
from app.services.matching_service import get_dashboard_stats
from app.middleware.auth_middleware import get_authenticated_user
from app.services.idea_service import get_idea_for_user

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(user=Depends(get_authenticated_user), db: Session = Depends(get_db)):
    """Get dashboard statistics for the current user."""
    stats = get_dashboard_stats(db, user)
    return DashboardStats(**stats)


@router.post("/milestones", response_model=MilestoneResponse, status_code=201)
def create_milestone(
    data: MilestoneCreate,
    user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """Add a milestone to a startup idea."""
    _ = get_idea_for_user(db, data.idea_id, user)
    milestone = StartupProgress(
        idea_id=data.idea_id,
        milestone=data.milestone,
        description=data.description,
        stage=StartupStage(data.stage) if data.stage else StartupStage.IDEATION,
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return MilestoneResponse.model_validate(milestone)


@router.get("/milestones/{idea_id}", response_model=List[MilestoneResponse])
def list_milestones(idea_id: UUID, db: Session = Depends(get_db), user=Depends(get_authenticated_user)):
    """List milestones for a startup idea."""
    _ = get_idea_for_user(db, idea_id, user)
    milestones = (
        db.query(StartupProgress)
        .filter(StartupProgress.idea_id == idea_id)
        .order_by(StartupProgress.created_at.desc())
        .all()
    )
    return [MilestoneResponse.model_validate(m) for m in milestones]


@router.put("/milestones/{milestone_id}/complete")
def complete_milestone(
    milestone_id: UUID,
    user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """Mark a milestone as completed."""
    milestone = db.query(StartupProgress).filter(StartupProgress.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    _ = get_idea_for_user(db, milestone.idea_id, user)
    milestone.is_completed = "true"
    milestone.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(milestone)
    return MilestoneResponse.model_validate(milestone)


@router.patch("/milestones/{milestone_id}", response_model=MilestoneResponse)
def update_milestone(
    milestone_id: UUID,
    data: MilestoneUpdate,
    user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """Update milestone fields (name/description/stage/kpis)."""
    milestone = db.query(StartupProgress).filter(StartupProgress.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    _ = get_idea_for_user(db, milestone.idea_id, user)

    update = data.model_dump(exclude_unset=True)
    if "stage" in update and update["stage"]:
        update["stage"] = StartupStage(update["stage"])
    for k, v in update.items():
        setattr(milestone, k, v)
    db.commit()
    db.refresh(milestone)
    return MilestoneResponse.model_validate(milestone)
