"""AI Chatbot router — startup mentor assistant."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.mentor import ChatMessage, ChatResponse
from app.ai.chatbot import get_chatbot_response
from app.middleware.auth_middleware import get_authenticated_user
from app.services.idea_service import get_idea_for_user

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    message: ChatMessage,
    user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """Send a message to the AI startup mentor chatbot."""
    idea_context = None
    if message.idea_id:
        idea = get_idea_for_user(db, message.idea_id, user)
        idea_context = {
            "title": idea.title,
            "problem_statement": idea.problem_statement,
            "proposed_solution": idea.proposed_solution,
            "target_market": idea.target_market,
            "category": idea.category,
            "ai_score": idea.ai_score,
        }

    result = await get_chatbot_response(
        user_message=message.message,
        user_name=user.full_name,
        idea_context=idea_context,
    )
    return ChatResponse(**result)
