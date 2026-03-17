"""
MU Innovation Hub — FastAPI Application Entry Point.

AI-Powered University Innovation & Startup Incubation Platform.
"""
import logging
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

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered University Innovation & Startup Incubation Platform for Mekelle University",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#  Routers 


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
    """Root endpoint for platform health checks (Render/Vercel)."""
    return {"status": "ok", "service": settings.APP_NAME, "version": settings.APP_VERSION}


@app.head("/", include_in_schema=False)
def root_head():
    return


#  Startup Event 
@app.on_event("startup")
async def on_startup():
    """Create database tables if they don't exist."""
    Base.metadata.create_all(bind=engine)
    logger.info("%s v%s is running", settings.APP_NAME, settings.APP_VERSION)


#  Health Check 
@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME, "version": settings.APP_VERSION}
