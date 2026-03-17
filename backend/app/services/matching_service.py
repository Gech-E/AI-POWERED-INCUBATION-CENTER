"""Matching service: mentor/investor recommendation and match management."""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException

from app.models.match import Match, MatchType, MatchStatus
from app.models.mentor import Mentor
from app.models.investor import Investor
from app.models.startup_idea import StartupIdea
from app.models.user import User


def create_match(db: Session, idea_id: UUID, matched_user_id: UUID, match_type: str, match_score: float = None, message: str = None) -> Match:
    match = Match(
        idea_id=idea_id,
        matched_user_id=matched_user_id,
        match_type=MatchType(match_type),
        match_score=match_score,
        status=MatchStatus.PENDING,
        message=message,
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    return match


def get_matches_for_user(db: Session, user_id: UUID, match_type: Optional[str] = None) -> List[Match]:
    query = db.query(Match).filter(Match.matched_user_id == user_id)
    if match_type:
        query = query.filter(Match.match_type == match_type)
    return query.order_by(Match.created_at.desc()).all()


def get_matches_for_idea(db: Session, idea_id: UUID) -> List[Match]:
    return db.query(Match).filter(Match.idea_id == idea_id).order_by(Match.created_at.desc()).all()


def update_match_status(db: Session, match_id: UUID, user_id: UUID, new_status: str) -> Match:
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if str(match.matched_user_id) != str(user_id):
        raise HTTPException(status_code=403, detail="Not authorized to update this match")
    match.status = MatchStatus(new_status)
    db.commit()
    db.refresh(match)
    return match


def get_all_mentors(db: Session, expertise: Optional[str] = None) -> List[dict]:
    query = db.query(Mentor, User).join(User, Mentor.user_id == User.id)
    results = query.all()
    mentor_list = []
    for mentor, user in results:
        # Python-level filtering for SQLite compat (ArrayType stores as JSON text)
        if expertise and mentor.expertise:
            if expertise not in mentor.expertise:
                continue
        elif expertise and not mentor.expertise:
            continue
        mentor_dict = {
            "id": str(mentor.id),
            "user_id": str(mentor.user_id),
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "expertise": mentor.expertise,
            "industries": mentor.industries,
            "years_experience": mentor.years_experience,
            "company": mentor.company,
            "job_title": mentor.job_title,
            "availability": mentor.availability.value if mentor.availability else "available",
            "max_mentees": mentor.max_mentees,
            "current_mentees": mentor.current_mentees,
            "rating": mentor.rating,
            "total_sessions": mentor.total_sessions,
            "bio": mentor.bio or user.bio,
        }
        mentor_list.append(mentor_dict)
    return mentor_list


def get_all_investors(db: Session, focus: Optional[str] = None) -> List[dict]:
    query = db.query(Investor, User).join(User, Investor.user_id == User.id)
    results = query.all()
    investor_list = []
    for investor, user in results:
        investor_dict = {
            "id": str(investor.id),
            "user_id": str(investor.user_id),
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "investment_focus": investor.investment_focus,
            "min_investment": float(investor.min_investment) if investor.min_investment else None,
            "max_investment": float(investor.max_investment) if investor.max_investment else None,
            "portfolio_count": investor.portfolio_count,
            "fund_name": investor.fund_name,
            "website": investor.website,
            "preferred_stage": investor.preferred_stage,
            "bio": investor.bio or user.bio,
        }
        investor_list.append(investor_dict)
    return investor_list


def get_dashboard_stats(db: Session, user: Optional[User] = None) -> dict:
    from app.models.startup_idea import StartupIdea, IdeaStatus

    ideas_query = db.query(StartupIdea)
    if user and user.role.value == "student":
        ideas_query = ideas_query.filter(StartupIdea.user_id == user.id)

    total_ideas = ideas_query.count()
    evaluated = ideas_query.filter(StartupIdea.status == IdeaStatus.EVALUATED).count()
    incubating = ideas_query.filter(StartupIdea.status == IdeaStatus.INCUBATING).count()
    avg_score = ideas_query.filter(StartupIdea.ai_score.isnot(None)).with_entities(func.avg(StartupIdea.ai_score)).scalar()

    total_mentors = db.query(Mentor).count()
    total_investors = db.query(Investor).count()
    total_matches = db.query(Match).count()

    recent = ideas_query.order_by(StartupIdea.created_at.desc()).limit(5).all()
    recent_ideas = [
        {"id": str(i.id), "title": i.title, "status": i.status.value, "ai_score": i.ai_score, "created_at": str(i.created_at)}
        for i in recent
    ]

    return {
        "total_ideas": total_ideas,
        "evaluated_ideas": evaluated,
        "incubating_ideas": incubating,
        "total_mentors": total_mentors,
        "total_investors": total_investors,
        "total_matches": total_matches,
        "avg_ai_score": round(avg_score, 1) if avg_score else None,
        "recent_ideas": recent_ideas,
    }
