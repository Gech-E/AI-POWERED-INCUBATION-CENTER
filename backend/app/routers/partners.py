"""Partners router — list industry partners."""

from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.partner_service import get_all_partners
from app.schemas.partner import PartnerResponse

router = APIRouter()


@router.get("/", response_model=List[PartnerResponse])
def list_partners(
    industry: Optional[str] = None,
    capability: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """List partners (optionally filter by industry/capability)."""
    return get_all_partners(db, industry=industry, capability=capability, skip=skip, limit=limit)

