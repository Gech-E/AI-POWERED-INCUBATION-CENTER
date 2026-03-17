"""Investor model."""
import uuid
from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey, Numeric
from app.compat import ArrayType, UUIDType
from sqlalchemy.orm import relationship
from app.database import Base


class Investor(Base):
    __tablename__ = "investors"

    id = Column(UUIDType(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUIDType(), ForeignKey("users.id"), unique=True, nullable=False)
    investment_focus = Column(ArrayType, nullable=True)  # ["AgriTech", "EdTech"]
    min_investment = Column(Numeric(12, 2), nullable=True)
    max_investment = Column(Numeric(12, 2), nullable=True)
    portfolio_count = Column(Integer, default=0)
    fund_name = Column(String(200), nullable=True)
    website = Column(String(500), nullable=True)
    preferred_stage = Column(String(100), nullable=True)  # "ideation", "seed", "series-a"
    bio = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="investor_profile")

    def __repr__(self):
        return f"<Investor {self.user_id} - {self.investment_focus}>"
