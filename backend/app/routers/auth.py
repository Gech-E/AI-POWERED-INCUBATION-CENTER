"""Authentication router — register, login, profile."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserRegister, UserLogin, Token, UserResponse, UserUpdate
from app.services.auth_service import register_user, login_user
from app.middleware.auth_middleware import get_authenticated_user

router = APIRouter()


@router.post("/register", response_model=Token)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account."""
    return register_user(db, user_data)


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate and receive a JWT token."""
    return login_user(db, user_data)


@router.get("/me", response_model=UserResponse)
def get_profile(user=Depends(get_authenticated_user)):
    """Get current user's profile."""
    return UserResponse.model_validate(user)


@router.put("/me", response_model=UserResponse)
def update_profile(
    updates: UserUpdate,
    user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """Update current user's profile."""
    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)
