"""Application configuration using pydantic-settings."""
from __future__ import annotations

from pydantic_settings import BaseSettings
from functools import lru_cache
from pydantic import computed_field, model_validator


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "MU Innovation Hub"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False  # Safe default — override with DEBUG=True locally

    # Server
    PORT: int = 8000  # Render injects $PORT

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

    # CORS — set FRONTEND_URL to your Vercel domain in production
    FRONTEND_URL: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True

    @computed_field  # type: ignore[misc]
    @property
    def ALLOWED_ORIGINS(self) -> list[str]:
        """Build the CORS allow-origins list dynamically."""
        origins: list[str] = []
        if self.FRONTEND_URL:
            origins.append(self.FRONTEND_URL.rstrip("/"))
        if self.DEBUG:
            origins += ["http://localhost:3000", "http://127.0.0.1:3000"]
        return origins

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
