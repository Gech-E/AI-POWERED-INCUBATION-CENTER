"""Investors router — profiles and listing."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.investor import Investor
from app.schemas.investor import InvestorCreate, InvestorResponse
from app.middleware.auth_middleware import get_authenticated_user, role_required
from app.services.matching_service import get_all_investors

router = APIRouter()


@router.get("/")
def list_investors(focus: Optional[str] = None, db: Session = Depends(get_db)):
    """List all investors."""
    return get_all_investors(db, focus=focus)


@router.post("/profile", response_model=InvestorResponse)
def create_investor_profile(
    data: InvestorCreate,
    user=Depends(role_required(["investor", "admin"])),
    db: Session = Depends(get_db),
):
    """Create an investor profile for the current user."""
    existing = db.query(Investor).filter(Investor.user_id == user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Investor profile already exists")

    investor = Investor(
        user_id=user.id,
        investment_focus=data.investment_focus,
        min_investment=data.min_investment,
        max_investment=data.max_investment,
        fund_name=data.fund_name,
        website=data.website,
        preferred_stage=data.preferred_stage,
        bio=data.bio,
    )
    db.add(investor)
    db.commit()
    db.refresh(investor)
    return InvestorResponse(
        id=investor.id,
        user_id=investor.user_id,
        investment_focus=investor.investment_focus,
        min_investment=float(investor.min_investment) if investor.min_investment else None,
        max_investment=float(investor.max_investment) if investor.max_investment else None,
        portfolio_count=investor.portfolio_count,
        fund_name=investor.fund_name,
        website=investor.website,
        preferred_stage=investor.preferred_stage,
        bio=investor.bio,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
    )
