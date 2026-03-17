"""
AI Idea Evaluator — Scores startup ideas using NLP analysis.

Uses OpenAI/Gemini when API key is available, falls back to a rule-based
TF-IDF scoring engine for offline/no-key usage.
"""
import json
import logging
import re
from typing import Dict, Any

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


# ── Rule-based fallback evaluator ────────────────────────────────────
POSITIVE_MARKET_KEYWORDS = [
    "large market", "growing market", "billion", "million users", "scalable",
    "global", "underserved", "demand", "emerging", "untapped", "revenue",
    "monetization", "b2b", "b2c", "saas", "subscription", "marketplace",
]

INNOVATION_KEYWORDS = [
    "novel", "unique", "first", "patent", "proprietary", "disrupts",
    "innovative", "breakthrough", "cutting-edge", "ai", "machine learning",
    "blockchain", "iot", "deep learning", "automation", "revolutionary",
]

TECH_FEASIBILITY_KEYWORDS = [
    "api", "cloud", "aws", "gcp", "azure", "react", "python", "mvp",
    "prototype", "agile", "microservice", "database", "mobile app",
    "web app", "open source", "framework", "docker", "kubernetes",
]

TEAM_KEYWORDS = [
    "experienced", "developer", "engineer", "designer", "mba",
    "co-founder", "cto", "ceo", "technical", "business",
    "years of experience", "track record", "expertise",
]


def _keyword_score(text: str, keywords: list) -> float:
    text_lower = text.lower()
    matches = sum(1 for kw in keywords if kw in text_lower)
    ratio = matches / max(len(keywords), 1)
    return min(round(ratio * 100, 1), 95)


def _basic_text_quality(text: str) -> float:
    """Score based on length, structure, and detail."""
    score = 0
    word_count = len(text.split())
    if word_count > 20:
        score += 20
    if word_count > 50:
        score += 15
    if word_count > 100:
        score += 10
    sentences = text.count('.') + text.count('!') + text.count('?')
    if sentences > 3:
        score += 15
    if sentences > 6:
        score += 10
    if any(c.isdigit() for c in text):
        score += 10
    if any(marker in text.lower() for marker in ["1.", "2.", "•", "-", "step"]):
        score += 10
    return min(score, 80)


def evaluate_idea_fallback(idea_data: dict) -> Dict[str, Any]:
    """Rule-based idea evaluation when no LLM API key is available."""
    combined_text = f"{idea_data.get('title', '')} {idea_data.get('problem_statement', '')} {idea_data.get('proposed_solution', '')} {idea_data.get('target_market', '')}"

    market_score = max(
        _keyword_score(combined_text, POSITIVE_MARKET_KEYWORDS),
        _basic_text_quality(idea_data.get("target_market", "")) * 0.8
    )
    market_score = min(max(market_score, 15), 90)

    tech_score = _keyword_score(combined_text, TECH_FEASIBILITY_KEYWORDS)
    tech_stack = idea_data.get("tech_stack", [])
    if tech_stack and len(tech_stack) >= 2:
        tech_score = min(tech_score + 25, 90)
    tech_score = min(max(tech_score, 20), 90)

    innovation_score = max(
        _keyword_score(combined_text, INNOVATION_KEYWORDS),
        _basic_text_quality(idea_data.get("proposed_solution", "")) * 0.6
    )
    innovation_score = min(max(innovation_score, 15), 90)

    team_score = 50.0  # default
    team_members = idea_data.get("team_members", [])
    if team_members:
        team_score = min(30 + len(team_members) * 15, 85)
        team_text = json.dumps(team_members) if isinstance(team_members, list) else str(team_members)
        team_score = max(team_score, _keyword_score(team_text, TEAM_KEYWORDS))

    overall = round(
        market_score * 0.30 + tech_score * 0.25 + innovation_score * 0.25 + team_score * 0.20,
        1
    )

    strengths = []
    weaknesses = []
    suggestions = []

    if market_score >= 50:
        strengths.append("Good market potential identified")
    else:
        weaknesses.append("Market potential needs more definition")
        suggestions.append("Add specific market size data and target customer segments")

    if tech_score >= 50:
        strengths.append("Solid technical approach")
    else:
        weaknesses.append("Technical feasibility could be strengthened")
        suggestions.append("Detail the technology stack and development timeline")

    if innovation_score >= 50:
        strengths.append("Innovative concept with differentiation potential")
    else:
        weaknesses.append("Innovation level could be improved")
        suggestions.append("Highlight what makes your solution unique vs existing alternatives")

    if team_score >= 50:
        strengths.append("Capable team composition")
    else:
        weaknesses.append("Team capability needs strengthening")
        suggestions.append("Add team members with complementary skills (technical + business)")

    if not strengths:
        strengths.append("The idea addresses a real problem")

    suggestions.append("Consider creating a lean canvas to refine your business model")
    suggestions.append("Validate your idea with potential customers before building")

    return {
        "overall_score": overall,
        "market_potential": market_score,
        "technical_feasibility": tech_score,
        "innovation_level": innovation_score,
        "team_capability": team_score,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": suggestions,
        "summary": f"Your startup idea '{idea_data.get('title', 'Untitled')}' received an overall score of {overall}/100. "
                   f"Market potential: {market_score}/100, Technical feasibility: {tech_score}/100, "
                   f"Innovation: {innovation_score}/100, Team: {team_score}/100.",
    }


async def evaluate_idea_with_llm(idea_data: dict) -> Dict[str, Any]:
    """Evaluate using OpenAI or Google Gemini API."""
    prompt = f"""You are an expert startup evaluator at a university incubation program.
Evaluate this startup idea and provide scores from 0-100 for each category.

STARTUP IDEA:
Title: {idea_data.get('title', 'N/A')}
Problem Statement: {idea_data.get('problem_statement', 'N/A')}
Proposed Solution: {idea_data.get('proposed_solution', 'N/A')}
Target Market: {idea_data.get('target_market', 'N/A')}
Technology Stack: {', '.join(idea_data.get('tech_stack', [])) if idea_data.get('tech_stack') else 'Not specified'}
Team Members: {json.dumps(idea_data.get('team_members', []))}

Respond ONLY with valid JSON in this exact format:
{{
    "overall_score": <0-100>,
    "market_potential": <0-100>,
    "technical_feasibility": <0-100>,
    "innovation_level": <0-100>,
    "team_capability": <0-100>,
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2"],
    "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
    "summary": "Brief 2-3 sentence evaluation summary"
}}"""

    try:
        if settings.LLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY, timeout=30.0, max_retries=2)
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"},
            )
            parsed = json.loads(response.choices[0].message.content)
            if not isinstance(parsed, dict) or "overall_score" not in parsed:
                raise ValueError("LLM returned invalid evaluation JSON")
            return parsed

        elif settings.LLM_PROVIDER == "google" and settings.GOOGLE_API_KEY:
            import google.generativeai as genai
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            text = response.text
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                parsed = json.loads(json_match.group())
                if not isinstance(parsed, dict) or "overall_score" not in parsed:
                    raise ValueError("LLM returned invalid evaluation JSON")
                return parsed

    except Exception as e:
        logger.exception("LLM evaluation failed; falling back to rule-based")

    return evaluate_idea_fallback(idea_data)


async def evaluate_idea(idea_data: dict) -> Dict[str, Any]:
    """Main evaluation entry point — tries LLM, falls back to rules."""
    if settings.OPENAI_API_KEY or settings.GOOGLE_API_KEY:
        return await evaluate_idea_with_llm(idea_data)
    return evaluate_idea_fallback(idea_data)
