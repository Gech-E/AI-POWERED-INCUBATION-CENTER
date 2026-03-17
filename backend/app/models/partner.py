"""Industry Partner model."""

import uuid
from sqlalchemy import Column, String, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.compat import ArrayType, UUIDType
from app.database import Base


class Partner(Base):
    __tablename__ = "partners"

    id = Column(UUIDType(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUIDType(), ForeignKey("users.id"), unique=True, nullable=False, index=True)

    organization = Column(String(200), nullable=True)
    job_title = Column(String(200), nullable=True)
    partnership_types = Column(ArrayType, nullable=True)  # ["pilot", "distribution", "manufacturing", ...]
    industries = Column(ArrayType, nullable=True)  # ["AgriTech", "HealthTech", ...]
    capabilities = Column(ArrayType, nullable=True)  # ["logistics", "regulatory", "sales", ...]
    preferred_stage = Column(String(100), nullable=True)  # "ideation", "mvp", "growth", ...
    years_experience = Column(Integer, nullable=True)
    website = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="partner_profile")

    def __repr__(self):
        return f"<Partner {self.user_id} - {self.organization}>"

