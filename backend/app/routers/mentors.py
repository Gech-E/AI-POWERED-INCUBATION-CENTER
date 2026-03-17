"""Mentors router — profiles, listing, sessions."""
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.mentor import Mentor, Availability
from app.models.mentor_session import MentorSession
from app.schemas.mentor import MentorCreate, MentorResponse
from app.schemas.mentor_session import MentorSessionCreate, MentorSessionResponse
from app.middleware.auth_middleware import get_authenticated_user, role_required
from app.services.matching_service import get_all_mentors
from app.services.idea_service import get_idea_for_user
from app.models.user import User

router = APIRouter()


@router.get("/")
def list_mentors(expertise: Optional[str] = None, db: Session = Depends(get_db)):
    """List all available mentors."""
    return get_all_mentors(db, expertise=expertise)


@router.post("/profile", response_model=MentorResponse)
def create_mentor_profile(
    data: MentorCreate,
    user=Depends(role_required(["mentor", "admin"])),
    db: Session = Depends(get_db),
):
    """Create a mentor profile for the current user."""
    existing = db.query(Mentor).filter(Mentor.user_id == user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mentor profile already exists")

    mentor = Mentor(
        user_id=user.id,
        expertise=data.expertise,
        industries=data.industries,
        years_experience=data.years_experience,
        company=data.company,
        job_title=data.job_title,
        max_mentees=data.max_mentees,
        bio=data.bio,
    )
    db.add(mentor)
    db.commit()
    db.refresh(mentor)
    return MentorResponse(
        id=mentor.id,
        user_id=mentor.user_id,
        expertise=mentor.expertise,
        industries=mentor.industries,
        years_experience=mentor.years_experience,
        company=mentor.company,
        job_title=mentor.job_title,
        availability=mentor.availability.value,
        max_mentees=mentor.max_mentees,
        current_mentees=mentor.current_mentees,
        rating=mentor.rating,
        total_sessions=mentor.total_sessions,
        bio=mentor.bio,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
    )


@router.post("/sessions")
def create_session(data: MentorSessionCreate, user=Depends(get_authenticated_user), db: Session = Depends(get_db)):
    """Book a mentorship session."""
    _ = get_idea_for_user(db, data.idea_id, user)
    mentor = db.query(Mentor).filter(Mentor.id == data.mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    if mentor.availability and mentor.availability.value == "unavailable":
        raise HTTPException(status_code=400, detail="Mentor is unavailable")

    session = MentorSession(
        mentor_id=data.mentor_id,
        idea_id=data.idea_id,
        session_date=data.session_date,
        duration_minutes=data.duration_minutes,
        notes=data.notes,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return MentorSessionResponse.model_validate(session)


@router.get("/sessions/{idea_id}")
def list_sessions(idea_id: UUID, db: Session = Depends(get_db), user=Depends(get_authenticated_user)):
    """List mentor sessions for an idea."""
    _ = get_idea_for_user(db, idea_id, user)
    sessions = (
        db.query(MentorSession, Mentor, User)
        .join(Mentor, MentorSession.mentor_id == Mentor.id)
        .join(User, Mentor.user_id == User.id)
        .filter(MentorSession.idea_id == idea_id)
        .order_by(MentorSession.session_date.desc())
        .all()
    )
    out: List[dict] = []
    for s, mentor, u in sessions:
        out.append(
            {
                "id": s.id,
                "mentor_id": s.mentor_id,
                "idea_id": s.idea_id,
                "session_date": s.session_date,
                "duration_minutes": s.duration_minutes,
                "notes": s.notes,
                "feedback": s.feedback,
                "rating": s.rating,
                "mentor_name": u.full_name,
            }
        )
    return out
