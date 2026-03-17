"""
MU Innovation Hub — FastAPI Application Entry Point.

AI-Powered University Innovation & Startup Incubation Platform.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine, Base
from app.routers import auth, ideas, mentors, investors, partners, networking, dashboard, chatbot  # noqa: E402
from app.models import *  # noqa: F401,F403 — register all models with Base

settings = get_settings()
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan ────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(application: FastAPI):
    """Startup / shutdown lifecycle."""
    # Startup: create tables (fine for MVP; swap for Alembic later)
    Base.metadata.create_all(bind=engine)
    logger.info("%s v%s is running", settings.APP_NAME, settings.APP_VERSION)
    yield
    # Shutdown: nothing to clean up yet
    logger.info("Shutting down %s", settings.APP_NAME)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered University Innovation & Startup Incubation Platform for Mekelle University",
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# ── CORS ────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────────────
app.include_router(auth.router,       prefix="/api/auth",       tags=["Authentication"])
app.include_router(ideas.router,      prefix="/api/ideas",      tags=["Startup Ideas"])
app.include_router(mentors.router,    prefix="/api/mentors",    tags=["Mentors"])
app.include_router(investors.router,  prefix="/api/investors",  tags=["Investors"])
app.include_router(partners.router,   prefix="/api/partners",   tags=["Partners"])
app.include_router(networking.router, prefix="/api/networking", tags=["Networking"])
app.include_router(dashboard.router,  prefix="/api/dashboard",  tags=["Dashboard"])
app.include_router(chatbot.router,    prefix="/api/chatbot",    tags=["AI Chatbot"])


@app.get("/", include_in_schema=False)
def root():
    """Root endpoint for platform health checks (Render)."""
    return {"status": "ok", "service": settings.APP_NAME, "version": settings.APP_VERSION}


@app.head("/", include_in_schema=False)
def root_head():
    return


# ── Health Check ────────────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME, "version": settings.APP_VERSION}
