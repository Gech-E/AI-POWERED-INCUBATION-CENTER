"""
Test configuration — SQLite file database for isolated E2E testing.

Overrides the production PostgreSQL engine with SQLite so tests run
without any external dependencies.
"""
import os
import time
import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# ── Force SQLite BEFORE any app imports ──────────────────────────────
os.environ["DATABASE_URL"] = "sqlite:///./test_e2e.db"

# Clear the cached settings so the env var change takes effect
from app.config import get_settings  # noqa: E402
get_settings.cache_clear()

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402

SQLALCHEMY_TEST_URL = "sqlite:///./test_e2e.db"

engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False},
)

# Enable WAL mode and foreign keys for SQLite
@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.close()

TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


# ── Fixtures ─────────────────────────────────────────────────────────

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables once for the entire test session."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    # Ensure all SQLite file handles are released on Windows
    engine.dispose()
    # Clean up the test DB file
    if os.path.exists("test_e2e.db"):
        # Windows can keep file handles briefly; retry a few times.
        for _ in range(8):
            try:
                os.remove("test_e2e.db")
                break
            except PermissionError:
                time.sleep(0.15)


@pytest.fixture(scope="session")
def client():
    """Provide a TestClient scoped to the entire test session."""
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def student_token(client):
    """Register a student and return the JWT token."""
    resp = client.post("/api/auth/register", json={
        "email": "student@test.com",
        "password": "testpass123",
        "full_name": "Test Student",
        "role": "student",
        "university": "Mekelle University",
        "department": "Computer Science",
    })
    assert resp.status_code == 200, f"Student registration failed: {resp.text}"
    data = resp.json()
    return data["access_token"]


@pytest.fixture(scope="session")
def mentor_token(client):
    """Register a mentor and return the JWT token."""
    resp = client.post("/api/auth/register", json={
        "email": "mentor@test.com",
        "password": "testpass123",
        "full_name": "Test Mentor",
        "role": "mentor",
    })
    assert resp.status_code == 200, f"Mentor registration failed: {resp.text}"
    return resp.json()["access_token"]


@pytest.fixture(scope="session")
def investor_token(client):
    """Register an investor and return the JWT token."""
    resp = client.post("/api/auth/register", json={
        "email": "investor@test.com",
        "password": "testpass123",
        "full_name": "Test Investor",
        "role": "investor",
    })
    assert resp.status_code == 200, f"Investor registration failed: {resp.text}"
    return resp.json()["access_token"]


def auth_header(token: str) -> dict:
    """Return Authorization header dict for a given token."""
    return {"Authorization": f"Bearer {token}"}

