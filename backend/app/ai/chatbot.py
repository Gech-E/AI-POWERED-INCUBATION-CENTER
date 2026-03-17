"""
AI Chatbot — Startup mentor assistant powered by LLM.

Uses OpenAI/Gemini when available, falls back to a curated knowledge base
for offline usage.
"""
import json
import logging
import re
from typing import Dict, Any, Optional

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# ── Fallback knowledge base ────────────────────────────────────────
STARTUP_KNOWLEDGE = {
    "business model": {
        "reply": (
            "A strong business model should answer: (1) Who is your customer? "
            "(2) What value do you deliver? (3) How do you make money? "
            "Consider using the Business Model Canvas — it covers 9 key building blocks: "
            "customer segments, value propositions, channels, customer relationships, "
            "revenue streams, key resources, key activities, key partnerships, and cost structure."
        ),
        "suggestions": ["Create a Business Model Canvas", "Identify your primary revenue stream", "Map your customer journey"],
    },
    "mvp": {
        "reply": (
            "An MVP (Minimum Viable Product) is the simplest version of your product that "
            "delivers your core value proposition. Steps: (1) Identify your riskiest assumption, "
            "(2) Build the smallest thing that tests it, (3) Measure results, (4) Learn and iterate. "
            "Focus on solving ONE problem really well before expanding."
        ),
        "suggestions": ["List your top 3 riskiest assumptions", "Define your core feature", "Plan a 2-week sprint to build MVP"],
    },
    "pitch": {
        "reply": (
            "A great pitch deck should have: (1) Problem — what pain are you solving? "
            "(2) Solution — your unique approach, (3) Market size — TAM/SAM/SOM, "
            "(4) Business model — how you make money, (5) Traction — any early results, "
            "(6) Team — why you can execute, (7) Ask — what you need. "
            "Keep it to 10-12 slides and practice your 60-second elevator pitch."
        ),
        "suggestions": ["Draft a 10-slide pitch deck", "Practice 60-second elevator pitch", "Research your TAM/SAM/SOM"],
    },
    "market": {
        "reply": (
            "Market validation involves: (1) Customer interviews — talk to 20+ potential users, "
            "(2) Surveys — quantify demand, (3) Landing page test — measure signup interest, "
            "(4) Competitor analysis — identify gaps, (5) Pilot/beta — test with real users. "
            "The goal is to prove demand before building at scale."
        ),
        "suggestions": ["Conduct 10 customer interviews", "Create a landing page to test demand", "Analyze top 5 competitors"],
    },
    "funding": {
        "reply": (
            "For university startups, consider: (1) University grants and innovation funds, "
            "(2) National competitions and hackathons, (3) Angel investors, "
            "(4) Incubator/accelerator programs, (5) Government grants (e.g., iCog Labs, Ethiopian Innovation Fund). "
            "Start with non-dilutive funding (grants) before seeking equity investment."
        ),
        "suggestions": ["Apply to your university's innovation fund", "Research local accelerator programs", "Prepare financial projections"],
    },
}

DEFAULT_RESPONSE = {
    "reply": (
        "I'm your AI startup mentor! I can help you with:\n"
        "• Business model development\n"
        "• MVP planning and strategy\n"
        "• Pitch preparation\n"
        "• Market validation\n"
        "• Funding guidance\n\n"
        "What would you like to work on?"
    ),
    "suggestions": ["Help me build a business model", "How should I plan my MVP?", "How do I validate my market?"],
}


def _find_best_topic(message: str) -> Optional[str]:
    """Match user message to a knowledge topic."""
    msg_lower = message.lower()
    for topic in STARTUP_KNOWLEDGE:
        if topic in msg_lower:
            return topic
    keyword_map = {
        "business model": ["canvas", "revenue", "monetize", "pricing"],
        "mvp": ["prototype", "minimum", "first version", "build"],
        "pitch": ["investor", "present", "deck", "demo day"],
        "market": ["customer", "validate", "research", "survey", "competitor"],
        "funding": ["invest", "grant", "fund", "capital", "money", "raise"],
    }
    for topic, keywords in keyword_map.items():
        if any(kw in msg_lower for kw in keywords):
            return topic
    return None


async def get_chatbot_response(
    user_message: str,
    user_name: str = "Student",
    idea_context: Optional[dict] = None,
) -> Dict[str, Any]:
    """Generate a chatbot response — tries LLM first, falls back to knowledge base."""

    # Try LLM if API key available
    if settings.OPENAI_API_KEY or settings.GOOGLE_API_KEY:
        try:
            return await _llm_response(user_message, user_name, idea_context)
        except Exception as e:
            logger.exception("LLM chatbot failed; using fallback")

    # Fallback to curated knowledge
    topic = _find_best_topic(user_message)
    if topic:
        resp = STARTUP_KNOWLEDGE[topic].copy()
        if idea_context:
            resp["reply"] = f"Regarding your startup '{idea_context.get('title', '')}': " + resp["reply"]
        return resp

    return DEFAULT_RESPONSE.copy()


async def _llm_response(
    user_message: str, user_name: str, idea_context: Optional[dict]
) -> Dict[str, Any]:
    """Get response from LLM."""
    system_prompt = f"""You are an expert AI startup mentor at Mekelle University's Innovation Hub.
You help students develop their startup ideas using lean startup methodology,
business model canvas, and practical startup advice.

The student's name is {user_name}.
{"Their current startup: " + json.dumps(idea_context) if idea_context else "They haven't selected a specific startup idea yet."}

Provide actionable, encouraging advice. Keep responses concise (2-4 paragraphs).
End with 2-3 suggested next actions.

Respond with valid JSON:
{{"reply": "your advice", "suggestions": ["action1", "action2", "action3"]}}"""

    if settings.LLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY, timeout=20.0, max_retries=2)
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.7,
            response_format={"type": "json_object"},
        )
        parsed = json.loads(response.choices[0].message.content)
        if not isinstance(parsed, dict) or "reply" not in parsed:
            raise ValueError("LLM returned invalid response JSON")
        return parsed

    elif settings.LLM_PROVIDER == "google" and settings.GOOGLE_API_KEY:
        import google.generativeai as genai
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(f"{system_prompt}\n\nStudent says: {user_message}")
        text = response.text
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            parsed = json.loads(json_match.group())
            if not isinstance(parsed, dict) or "reply" not in parsed:
                raise ValueError("LLM returned invalid response JSON")
            return parsed

    raise ValueError("No LLM provider configured")
