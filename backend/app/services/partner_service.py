"""Partner service: listing industry partners."""

from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.partner import Partner
from app.models.user import User


def get_all_partners(
    db: Session,
    industry: Optional[str] = None,
    capability: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> List[dict]:
    query = db.query(Partner, User).join(User, Partner.user_id == User.id)
    results = query.offset(skip).limit(limit).all()

    out: List[dict] = []
    for partner, user in results:
        # Python-level filtering for SQLite compat (ArrayType stores as JSON text)
        if industry:
            if not partner.industries or industry not in partner.industries:
                continue
        if capability:
            if not partner.capabilities or capability not in partner.capabilities:
                continue

        out.append(
            {
                "id": partner.id,
                "user_id": partner.user_id,
                "full_name": user.full_name,
                "avatar_url": user.avatar_url,
                "organization": partner.organization,
                "job_title": partner.job_title,
                "partnership_types": partner.partnership_types,
                "industries": partner.industries,
                "capabilities": partner.capabilities,
                "preferred_stage": partner.preferred_stage,
                "years_experience": partner.years_experience,
                "website": partner.website,
                "bio": partner.bio or user.bio,
            }
        )
    return out

