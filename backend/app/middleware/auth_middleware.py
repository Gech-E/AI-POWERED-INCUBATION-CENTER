"""
Authentication middleware — JWT bearer dependency and role-based access.
"""
from typing import List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.auth_service import get_current_user

security = HTTPBearer()


async def get_authenticated_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """FastAPI dependency — extracts and validates JWT, returns User."""
    return get_current_user(db, credentials.credentials)


def role_required(allowed_roles: List[str]):
    """Returns a dependency that enforces role-based access control."""
    async def _check_role(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: Session = Depends(get_db),
    ):
        user = get_current_user(db, credentials.credentials)
        if user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed_roles}",
            )
        return user
    return _check_role
