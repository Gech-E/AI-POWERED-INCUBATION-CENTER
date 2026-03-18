"""
End-to-End API tests for MU Innovation Hub.

This test module covers the full lifecycle of the platform:
  1. Health check
  2. Auth (register, login, profile, update, duplicate email, bad password)
  3. Startup Ideas (CRUD + AI evaluation)
  4. Mentor profiles and listing
  5. Investor profiles and listing
  6. Networking (AI recommendations, match lifecycle)
  7. Dashboard (stats, milestones, completion)
  8. AI Chatbot (knowledge-base fallback)

All tests use SQLite via conftest.py — no PostgreSQL required.
"""
import pytest
from tests.conftest import auth_header


# ══════════════════════════════════════════════════════════════════════
#  1. HEALTH CHECK
# ══════════════════════════════════════════════════════════════════════

class TestHealthCheck:
    def test_health_endpoint(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert "MU Innovation Hub" in data["app"]


# ══════════════════════════════════════════════════════════════════════
#  2. AUTHENTICATION FLOW
# ══════════════════════════════════════════════════════════════════════

class TestAuthFlow:
    def test_register_student(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "auth_test_student@test.com",
            "password": "securepass123",
            "full_name": "Auth Test Student",
            "role": "student",
            "university": "Mekelle University",
            "department": "Software Engineering",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "auth_test_student@test.com"
        assert data["user"]["role"] == "student"
        assert data["user"]["full_name"] == "Auth Test Student"

    def test_duplicate_email_rejected(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "auth_test_student@test.com",
            "password": "anotherpass123",
            "full_name": "Duplicate User",
        })
        assert resp.status_code == 400
        assert "already registered" in resp.json()["detail"].lower()

    def test_login_valid(self, client):
        resp = client.post("/api/auth/login", json={
            "email": "auth_test_student@test.com",
            "password": "securepass123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == "auth_test_student@test.com"

    def test_login_wrong_password(self, client):
        resp = client.post("/api/auth/login", json={
            "email": "auth_test_student@test.com",
            "password": "wrongpassword",
        })
        assert resp.status_code == 401

    def test_login_nonexistent_email(self, client):
        resp = client.post("/api/auth/login", json={
            "email": "nobody@test.com",
            "password": "whatever",
        })
        assert resp.status_code == 401

    def test_get_profile(self, client, student_token):
        resp = client.get("/api/auth/me", headers=auth_header(student_token))
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "student@test.com"
        assert data["full_name"] == "Test Student"
        assert "id" in data
        assert "created_at" in data

    def test_get_profile_no_auth(self, client):
        resp = client.get("/api/auth/me")
        # HTTPBearer returns 403 when auth header missing in some configs,
        # but our dependency returns 401 Unauthorized for missing/invalid credentials.
        assert resp.status_code == 401

    def test_update_profile(self, client, student_token):
        resp = client.put("/api/auth/me", json={
            "bio": "I am a CS student interested in AI startups",
            "department": "Computer Science Updated",
        }, headers=auth_header(student_token))
        assert resp.status_code == 200
        data = resp.json()
        assert data["bio"] == "I am a CS student interested in AI startups"

    def test_password_too_short(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "short@test.com",
            "password": "short",
            "full_name": "Short Pass",
        })
        assert resp.status_code == 422  # Validation error


# ══════════════════════════════════════════════════════════════════════
#  3. STARTUP IDEAS FLOW
# ══════════════════════════════════════════════════════════════════════

class TestIdeasFlow:
    """Tests the full lifecycle: create → list → get → evaluate → update → delete."""

    idea_id = None  # Shared across ordered tests

    def test_create_idea(self, client, student_token):
        resp = client.post("/api/ideas/", json={
            "title": "AI-Powered Crop Disease Detection for Ethiopian Farmers",
            "problem_statement": (
                "Ethiopian farmers lose 20-30% of their crops annually due to undetected diseases. "
                "Most farmers in rural areas lack access to agricultural experts, leading to significant "
                "financial losses and food insecurity. Current detection methods are manual and unreliable."
            ),
            "proposed_solution": (
                "A mobile application that uses deep learning computer vision models to detect crop diseases "
                "from photos taken with a smartphone. The app will work offline using on-device ML inference "
                "and provide treatment recommendations in local languages (Amharic, Tigrinya)."
            ),
            "target_market": "Small-scale farmers in Ethiopia (8M+ potential users)",
            "tech_stack": ["Python", "TensorFlow", "Flutter", "Firebase"],
            "team_members": [
                {"name": "Abebe Kebede", "role": "CTO", "email": "abebe@mu.edu.et"},
                {"name": "Sara Hailu", "role": "ML Engineer"},
            ],
            "category": "AgriTech",
        }, headers=auth_header(student_token))
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "AI-Powered Crop Disease Detection for Ethiopian Farmers"
        assert data["status"] == "submitted"
        assert data["category"] == "AgriTech"
        assert data["tech_stack"] == ["Python", "TensorFlow", "Flutter", "Firebase"]
        assert len(data["team_members"]) == 2
        TestIdeasFlow.idea_id = data["id"]

    def test_list_ideas(self, client, student_token):
        resp = client.get("/api/ideas/", headers=auth_header(student_token))
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(i["title"].startswith("AI-Powered Crop") for i in data)

    def test_get_idea_by_id(self, client, student_token):
        assert TestIdeasFlow.idea_id is not None
        resp = client.get(f"/api/ideas/{TestIdeasFlow.idea_id}", headers=auth_header(student_token))
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == TestIdeasFlow.idea_id
        assert data["title"] == "AI-Powered Crop Disease Detection for Ethiopian Farmers"

    def test_evaluate_idea(self, client, student_token):
        """AI evaluation using the fallback rule-based engine (no LLM keys set)."""
        assert TestIdeasFlow.idea_id is not None
        resp = client.post(
            f"/api/ideas/{TestIdeasFlow.idea_id}/evaluate",
            headers=auth_header(student_token),
        )
        assert resp.status_code == 200
        data = resp.json()
        # After evaluation, status should be "evaluated"
        assert data["status"] == "evaluated"
        # AI scores should be present
        assert data["ai_score"] is not None
        assert 0 <= data["ai_score"] <= 100
        assert data["market_potential_score"] is not None
        assert data["technical_feasibility_score"] is not None
        assert data["innovation_score"] is not None
        assert data["team_capability_score"] is not None
        # Full evaluation object
        assert data["ai_evaluation"] is not None
        assert "strengths" in data["ai_evaluation"]
        assert "weaknesses" in data["ai_evaluation"]
        assert "suggestions" in data["ai_evaluation"]
        assert "summary" in data["ai_evaluation"]

    def test_update_idea(self, client, student_token):
        assert TestIdeasFlow.idea_id is not None
        resp = client.put(f"/api/ideas/{TestIdeasFlow.idea_id}", json={
            "target_market": "Small-scale farmers across East Africa (15M+ potential users)",
        }, headers=auth_header(student_token))
        assert resp.status_code == 200
        data = resp.json()
        assert "East Africa" in data["target_market"]

    def test_create_second_idea(self, client, student_token):
        """Create a second idea to test listing multiple and deletion."""
        resp = client.post("/api/ideas/", json={
            "title": "FinTech Mobile Money Platform for Unbanked Populations",
            "problem_statement": (
                "Over 70% of Ethiopia's population remains unbanked with no access to formal "
                "financial services, mobile banking, or credit facilities, limiting economic growth."
            ),
            "proposed_solution": (
                "A blockchain-based mobile money platform using USSD technology that works without "
                "smartphones, providing savings, micro-loans, and peer-to-peer transfers."
            ),
            "category": "FinTech",
        }, headers=auth_header(student_token))
        assert resp.status_code == 201
        self._second_idea_id = resp.json()["id"]

    def test_delete_idea(self, client, student_token):
        """Delete the second idea and verify it's gone."""
        resp = client.post("/api/ideas/", json={
            "title": "Temporary Idea For Deletion Testing",
            "problem_statement": "This idea is created only to test deletion functionality.",
            "proposed_solution": "We just need 20+ characters here for the validation to pass.",
        }, headers=auth_header(student_token))
        assert resp.status_code == 201
        temp_id = resp.json()["id"]

        resp = client.delete(f"/api/ideas/{temp_id}", headers=auth_header(student_token))
        assert resp.status_code == 200

        # Verify it's gone
        resp = client.get(f"/api/ideas/{temp_id}", headers=auth_header(student_token))
        assert resp.status_code == 404

    def test_idea_not_found(self, client, student_token):
        resp = client.get(
            "/api/ideas/00000000-0000-0000-0000-000000000000",
            headers=auth_header(student_token),
        )
        assert resp.status_code == 404


# ══════════════════════════════════════════════════════════════════════
#  4. MENTOR PROFILE FLOW
# ══════════════════════════════════════════════════════════════════════

class TestMentorFlow:
    mentor_profile_id = None

    def test_create_mentor_profile(self, client, mentor_token):
        resp = client.post("/api/mentors/profile", json={
            "expertise": ["AI/ML", "Computer Vision", "AgriTech"],
            "industries": ["Agriculture", "Technology"],
            "years_experience": 10,
            "company": "TechHub Africa",
            "job_title": "Senior AI Engineer",
            "max_mentees": 3,
            "bio": "Experienced AI engineer specializing in computer vision for agriculture.",
        }, headers=auth_header(mentor_token))
        assert resp.status_code == 200
        data = resp.json()
        assert data["expertise"] == ["AI/ML", "Computer Vision", "AgriTech"]
        assert data["years_experience"] == 10
        assert data["company"] == "TechHub Africa"
        assert data["full_name"] == "Test Mentor"
        TestMentorFlow.mentor_profile_id = data["id"]

    def test_duplicate_mentor_profile(self, client, mentor_token):
        resp = client.post("/api/mentors/profile", json={
            "expertise": ["Business"],
        }, headers=auth_header(mentor_token))
        assert resp.status_code == 400
        assert "already exists" in resp.json()["detail"].lower()

    def test_list_mentors(self, client):
        resp = client.get("/api/mentors/")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        mentor = data[0]
        assert "full_name" in mentor
        assert "expertise" in mentor

    def test_student_cannot_create_mentor_profile(self, client, student_token):
        resp = client.post("/api/mentors/profile", json={
            "expertise": ["Business"],
        }, headers=auth_header(student_token))
        assert resp.status_code == 403


# ══════════════════════════════════════════════════════════════════════
#  5. INVESTOR PROFILE FLOW
# ══════════════════════════════════════════════════════════════════════

class TestInvestorFlow:
    def test_create_investor_profile(self, client, investor_token):
        resp = client.post("/api/investors/profile", json={
            "investment_focus": ["AgriTech", "FinTech", "AI"],
            "min_investment": 10000,
            "max_investment": 500000,
            "fund_name": "East Africa Innovation Fund",
            "website": "https://eaif.example.com",
            "preferred_stage": "seed",
            "bio": "Early-stage investor focused on tech startups in East Africa.",
        }, headers=auth_header(investor_token))
        assert resp.status_code == 200
        data = resp.json()
        assert data["investment_focus"] == ["AgriTech", "FinTech", "AI"]
        assert data["min_investment"] == 10000
        assert data["max_investment"] == 500000
        assert data["fund_name"] == "East Africa Innovation Fund"
        assert data["full_name"] == "Test Investor"

    def test_duplicate_investor_profile(self, client, investor_token):
        resp = client.post("/api/investors/profile", json={
            "investment_focus": ["EdTech"],
        }, headers=auth_header(investor_token))
        assert resp.status_code == 400

    def test_list_investors(self, client):
        resp = client.get("/api/investors/")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_student_cannot_create_investor_profile(self, client, student_token):
        resp = client.post("/api/investors/profile", json={
            "investment_focus": ["EdTech"],
        }, headers=auth_header(student_token))
        assert resp.status_code == 403


# ══════════════════════════════════════════════════════════════════════
#  6. NETWORKING & AI MATCHING FLOW
# ══════════════════════════════════════════════════════════════════════

class TestNetworkingFlow:
    match_id = None

    def test_recommend_mentors(self, client, student_token):
        """AI-powered mentor recommendation using TF-IDF cosine similarity."""
        idea_id = TestIdeasFlow.idea_id
        assert idea_id is not None
        resp = client.post(
            f"/api/networking/recommend/mentors/{idea_id}",
            headers=auth_header(student_token),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        # We have at least one mentor in the system
        assert len(data) >= 1
        rec = data[0]
        assert "match_score" in rec
        assert "full_name" in rec
        assert "expertise" in rec
        assert rec["match_score"] >= 0

    def test_recommend_investors(self, client, student_token):
        """AI-powered investor recommendation using TF-IDF cosine similarity."""
        idea_id = TestIdeasFlow.idea_id
        assert idea_id is not None
        resp = client.post(
            f"/api/networking/recommend/investors/{idea_id}",
            headers=auth_header(student_token),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        rec = data[0]
        assert "match_score" in rec
        assert "investment_focus" in rec

    def test_request_match(self, client, student_token, mentor_token):
        """Create a mentor match request."""
        # Get mentor's user ID
        me = client.get("/api/auth/me", headers=auth_header(mentor_token))
        mentor_user_id = me.json()["id"]

        resp = client.post("/api/networking/match", json={
            "idea_id": TestIdeasFlow.idea_id,
            "matched_user_id": mentor_user_id,
            "match_type": "mentor",
            "message": "I'd love to have you as a mentor for my AgriTech startup!",
        }, headers=auth_header(student_token))
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "pending"
        assert data["match_type"] == "mentor"
        assert data["message"] == "I'd love to have you as a mentor for my AgriTech startup!"
        TestNetworkingFlow.match_id = data["id"]

    def test_list_my_matches(self, client, mentor_token):
        """The mentor should see the match in their list."""
        resp = client.get("/api/networking/matches", headers=auth_header(mentor_token))
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_list_idea_matches(self, client, student_token):
        resp = client.get(
            f"/api/networking/matches/idea/{TestIdeasFlow.idea_id}",
            headers=auth_header(student_token),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1

    def test_accept_match(self, client, mentor_token):
        assert TestNetworkingFlow.match_id is not None
        resp = client.put(
            f"/api/networking/match/{TestNetworkingFlow.match_id}/status?new_status=accepted",
            headers=auth_header(mentor_token),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "accepted"


# ══════════════════════════════════════════════════════════════════════
#  7. DASHBOARD & MILESTONES FLOW
# ══════════════════════════════════════════════════════════════════════

class TestDashboardFlow:
    milestone_id = None

    def test_dashboard_stats(self, client, student_token):
        resp = client.get("/api/dashboard/stats", headers=auth_header(student_token))
        assert resp.status_code == 200
        data = resp.json()
        # Verify stats structure
        assert "total_ideas" in data
        assert "evaluated_ideas" in data
        assert "incubating_ideas" in data
        assert "total_mentors" in data
        assert "total_investors" in data
        assert "total_matches" in data
        assert "recent_ideas" in data
        # Stats should reflect our test data
        assert data["total_ideas"] >= 1
        assert data["evaluated_ideas"] >= 1  # We evaluated one idea
        assert data["total_mentors"] >= 1
        assert data["total_investors"] >= 1
        assert data["total_matches"] >= 1
        # avg_ai_score should be present since we evaluated an idea
        assert data["avg_ai_score"] is not None
        assert 0 < data["avg_ai_score"] <= 100

    def test_create_milestone(self, client, student_token):
        resp = client.post("/api/dashboard/milestones", json={
            "idea_id": TestIdeasFlow.idea_id,
            "milestone": "Complete market research and customer interviews",
            "description": "Interview 20 farmers in Tigray region to validate the problem hypothesis",
            "stage": "validation",
        }, headers=auth_header(student_token))
        assert resp.status_code == 201
        data = resp.json()
        assert data["milestone"] == "Complete market research and customer interviews"
        assert data["stage"] == "validation"
        assert data["is_completed"] == "false"
        TestDashboardFlow.milestone_id = data["id"]

    def test_list_milestones(self, client, student_token):
        resp = client.get(
            f"/api/dashboard/milestones/{TestIdeasFlow.idea_id}",
            headers=auth_header(student_token),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_complete_milestone(self, client, student_token):
        assert TestDashboardFlow.milestone_id is not None
        resp = client.put(
            f"/api/dashboard/milestones/{TestDashboardFlow.milestone_id}/complete",
            headers=auth_header(student_token),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["is_completed"] == "true"
        assert data["completed_at"] is not None

    def test_create_multiple_milestones(self, client, student_token):
        """Create additional milestones across different stages."""
        milestones = [
            {"milestone": "Build MVP prototype", "stage": "mvp", "description": "First working prototype"},
            {"milestone": "Onboard 100 beta users", "stage": "growth", "description": "Initial user acquisition"},
        ]
        for m in milestones:
            resp = client.post("/api/dashboard/milestones", json={
                "idea_id": TestIdeasFlow.idea_id,
                **m,
            }, headers=auth_header(student_token))
            assert resp.status_code == 201

        # Verify all milestones are listed
        resp = client.get(
            f"/api/dashboard/milestones/{TestIdeasFlow.idea_id}",
            headers=auth_header(student_token),
        )
        assert len(resp.json()) >= 3


# ══════════════════════════════════════════════════════════════════════
#  8. AI CHATBOT FLOW
# ══════════════════════════════════════════════════════════════════════

class TestChatbotFlow:
    def test_chatbot_business_model(self, client, student_token):
        """Test chatbot with a business model query — should match knowledge base."""
        resp = client.post("/api/chatbot/chat", json={
            "message": "How do I build a business model for my startup?",
        }, headers=auth_header(student_token))
        assert resp.status_code == 200
        data = resp.json()
        assert "reply" in data
        assert len(data["reply"]) > 50  # Meaningful response
        assert "suggestions" in data
        # Should match "business model" topic from knowledge base
        assert "business model" in data["reply"].lower() or "canvas" in data["reply"].lower()

    def test_chatbot_mvp_advice(self, client, student_token):
        resp = client.post("/api/chatbot/chat", json={
            "message": "How should I plan my MVP?",
        }, headers=auth_header(student_token))
        assert resp.status_code == 200
        data = resp.json()
        assert "reply" in data
        assert "mvp" in data["reply"].lower() or "minimum" in data["reply"].lower()

    def test_chatbot_with_idea_context(self, client, student_token):
        """Test chatbot with an idea_id for contextual advice."""
        resp = client.post("/api/chatbot/chat", json={
            "message": "What funding options should I consider?",
            "idea_id": TestIdeasFlow.idea_id,
        }, headers=auth_header(student_token))
        assert resp.status_code == 200
        data = resp.json()
        assert "reply" in data
        assert len(data["reply"]) > 30

    def test_chatbot_pitch_advice(self, client, student_token):
        resp = client.post("/api/chatbot/chat", json={
            "message": "Help me prepare a pitch deck",
        }, headers=auth_header(student_token))
        assert resp.status_code == 200
        data = resp.json()
        assert "reply" in data
        assert "suggestions" in data

    def test_chatbot_default_response(self, client, student_token):
        """Unknown topic should trigger the default mentor response."""
        resp = client.post("/api/chatbot/chat", json={
            "message": "Tell me about quantum physics",
        }, headers=auth_header(student_token))
        assert resp.status_code == 200
        data = resp.json()
        assert "reply" in data

    def test_chatbot_no_auth(self, client):
        resp = client.post("/api/chatbot/chat", json={
            "message": "Hello",
        })
        assert resp.status_code == 401


# ══════════════════════════════════════════════════════════════════════
#  9. MENTOR SESSIONS FLOW
# ══════════════════════════════════════════════════════════════════════

class TestMentorSessionFlow:
    def test_book_session(self, client, student_token, mentor_token):
        """Book a mentorship session."""
        # Get the mentor profile ID
        mentors = client.get("/api/mentors/").json()
        assert len(mentors) >= 1
        mentor_id = mentors[0]["id"]

        resp = client.post("/api/mentors/sessions", json={
            "mentor_id": mentor_id,
            "idea_id": TestIdeasFlow.idea_id,
            "session_date": "2026-04-15T14:00:00Z",
            "duration_minutes": 45,
            "notes": "Discuss MVP scope and go-to-market.",
        }, headers=auth_header(student_token))
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert data["duration_minutes"] == 45
        assert data["mentor_id"] == mentor_id

    def test_list_sessions(self, client, student_token):
        resp = client.get(
            f"/api/mentors/sessions/{TestIdeasFlow.idea_id}",
            headers=auth_header(student_token),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["duration_minutes"] == 45


# ══════════════════════════════════════════════════════════════════════
#  EDGE CASES & AUTHORIZATION
# ══════════════════════════════════════════════════════════════════════

class TestEdgeCases:
    def test_invalid_token(self, client):
        resp = client.get("/api/auth/me", headers={"Authorization": "Bearer invalidtoken123"})
        assert resp.status_code == 401

    def test_missing_required_fields(self, client, student_token):
        """Submitting an idea without required fields should return 422."""
        resp = client.post("/api/ideas/", json={
            "title": "Too Short",  # problem_statement and proposed_solution missing
        }, headers=auth_header(student_token))
        assert resp.status_code == 422

    def test_idea_title_too_short(self, client, student_token):
        resp = client.post("/api/ideas/", json={
            "title": "Hi",  # min_length=5
            "problem_statement": "A" * 25,
            "proposed_solution": "B" * 25,
        }, headers=auth_header(student_token))
        assert resp.status_code == 422
