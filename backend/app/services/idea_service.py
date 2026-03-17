"""Idea management service."""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.startup_idea import StartupIdea, IdeaStatus
from app.models.user import User
from app.schemas.startup_idea import IdeaCreate, IdeaUpdate


def create_idea(db: Session, user: User, idea_data: IdeaCreate) -> StartupIdea:
    team_members_dict = None
    if idea_data.team_members:
        team_members_dict = [tm.model_dump() for tm in idea_data.team_members]

    idea = StartupIdea(
        user_id=user.id,
        title=idea_data.title,
        problem_statement=idea_data.problem_statement,
        proposed_solution=idea_data.proposed_solution,
        target_market=idea_data.target_market,
        tech_stack=idea_data.tech_stack,
        team_members=team_members_dict,
        category=idea_data.category,
        status=IdeaStatus.SUBMITTED,
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return idea


def get_ideas(db: Session, user: Optional[User] = None, status: Optional[str] = None, skip: int = 0, limit: int = 20) -> List[StartupIdea]:
    query = db.query(StartupIdea)
    if user and user.role.value == "student":
        query = query.filter(StartupIdea.user_id == user.id)
    if status:
        query = query.filter(StartupIdea.status == status)
    return query.order_by(StartupIdea.created_at.desc()).offset(skip).limit(limit).all()


def get_idea_by_id(db: Session, idea_id: UUID) -> StartupIdea:
    idea = db.query(StartupIdea).filter(StartupIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    return idea


def get_idea_for_user(db: Session, idea_id: UUID, user: User) -> StartupIdea:
    """
    Fetch an idea and enforce access control.

    - Students can only access their own ideas.
    - Non-students (mentor/investor/admin) can access all ideas.
    """
    idea = get_idea_by_id(db, idea_id)
    if user.role.value == "student" and str(idea.user_id) != str(user.id):
        raise HTTPException(status_code=403, detail="Not authorized to access this idea")
    return idea


def update_idea(db: Session, idea_id: UUID, user: User, idea_data: IdeaUpdate) -> StartupIdea:
    idea = get_idea_by_id(db, idea_id)
    if str(idea.user_id) != str(user.id) and user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this idea")

    update_data = idea_data.model_dump(exclude_unset=True)
    if "team_members" in update_data and update_data["team_members"]:
        update_data["team_members"] = [tm if isinstance(tm, dict) else tm.model_dump() for tm in update_data["team_members"]]

    for key, value in update_data.items():
        setattr(idea, key, value)

    db.commit()
    db.refresh(idea)
    return idea


def delete_idea(db: Session, idea_id: UUID, user: User) -> bool:
    idea = get_idea_by_id(db, idea_id)
    if str(idea.user_id) != str(user.id) and user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this idea")
    db.delete(idea)
    db.commit()
    return True


def save_evaluation(db: Session, idea_id: UUID, evaluation: dict) -> StartupIdea:
    idea = get_idea_by_id(db, idea_id)
    idea.ai_score = evaluation.get("overall_score")
    idea.market_potential_score = evaluation.get("market_potential")
    idea.technical_feasibility_score = evaluation.get("technical_feasibility")
    idea.innovation_score = evaluation.get("innovation_level")
    idea.team_capability_score = evaluation.get("team_capability")
    idea.ai_evaluation = evaluation
    idea.status = IdeaStatus.EVALUATED
    db.commit()
    db.refresh(idea)
    return idea
