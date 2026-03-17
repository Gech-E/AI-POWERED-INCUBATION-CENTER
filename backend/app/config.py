"""Application configuration using pydantic-settings."""
from __future__ import annotations

from pydantic_settings import BaseSettings
from functools import lru_cache
from pydantic import model_validator


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "MU Innovation Hub"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./incubation.db"

    # JWT Auth
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # AI / LLM
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    LLM_PROVIDER: str = "openai"  # "openai" or "google"

    # CORS
    FRONTEND_URL: str = "https://ai-powered-incubation-center-hp3i.vercel.app"

    class Config:
        env_file = ".env"
        case_sensitive = True

    @model_validator(mode="after")
    def _validate_required_secrets(self) -> "Settings":
        # Fail fast in non-debug environments if secrets are missing.
        if not self.DEBUG:
            if not self.SECRET_KEY or len(self.SECRET_KEY) < 32:
                raise ValueError("SECRET_KEY must be set (>=32 chars) when DEBUG=false")
        return self


@lru_cache()
def get_settings() -> Settings:
    return Settings()
