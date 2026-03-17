"""
AI Recommender — Mentor/investor matching using TF-IDF cosine similarity.

Matches startup idea domain & tech stack against mentor expertise
and investor focus areas.
"""
from typing import List, Dict, Any
from collections import Counter
import math
from sqlalchemy.orm import Session

from app.models.mentor import Mentor
from app.models.investor import Investor
from app.models.partner import Partner
from app.models.user import User
from app.models.startup_idea import StartupIdea


def _build_idea_text(idea: StartupIdea) -> str:
    """Build a text representation of an idea for similarity matching."""
    parts = [
        idea.title or "",
        idea.problem_statement or "",
        idea.proposed_solution or "",
        idea.target_market or "",
        idea.category or "",
    ]
    if idea.tech_stack:
        parts.extend(idea.tech_stack)
    return " ".join(parts).lower()


def _tokenize(text: str) -> List[str]:
    # Simple, dependency-free tokenizer tuned for short bios/tags.
    # Keeps alphanumerics, splits on whitespace/punctuation.
    out: List[str] = []
    cur: List[str] = []
    for ch in text.lower():
        if ch.isalnum():
            cur.append(ch)
        else:
            if cur:
                out.append("".join(cur))
                cur = []
    if cur:
        out.append("".join(cur))
    # very small stopword set (avoid external deps)
    stop = {
        "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "with",
        "is", "are", "was", "were", "be", "as", "by", "at", "from", "that",
        "this", "it", "we", "you", "your", "our",
    }
    return [t for t in out if t not in stop and len(t) > 1]


def _tfidf_vectors(texts: List[str], max_features: int = 600) -> List[Dict[str, float]]:
    """
    Build sparse TF-IDF vectors as dict[token] -> weight.
    Dependency-free alternative to sklearn for local/dev environments.
    """
    tokenized = [_tokenize(t) for t in texts]
    df: Counter[str] = Counter()
    for toks in tokenized:
        df.update(set(toks))

    # Limit vocab by document frequency (top max_features)
    vocab = [t for t, _ in df.most_common(max_features)]
    vocab_set = set(vocab)
    n_docs = max(len(texts), 1)

    idf: Dict[str, float] = {}
    for t in vocab:
        # smooth IDF
        idf[t] = math.log((n_docs + 1) / (df[t] + 1)) + 1.0

    vectors: List[Dict[str, float]] = []
    for toks in tokenized:
        tf = Counter([t for t in toks if t in vocab_set])
        if not tf:
            vectors.append({})
            continue
        max_tf = max(tf.values())
        vec: Dict[str, float] = {}
        for t, c in tf.items():
            # normalized TF
            tf_norm = c / max_tf
            vec[t] = tf_norm * idf[t]
        vectors.append(vec)
    return vectors


def _cosine_sparse(a: Dict[str, float], b: Dict[str, float]) -> float:
    if not a or not b:
        return 0.0
    # dot over smaller dict
    if len(a) > len(b):
        a, b = b, a
    dot = sum(w * b.get(t, 0.0) for t, w in a.items())
    na = math.sqrt(sum(w * w for w in a.values()))
    nb = math.sqrt(sum(w * w for w in b.values()))
    if na == 0.0 or nb == 0.0:
        return 0.0
    return dot / (na * nb)


def _compute_similarity(idea_text: str, candidate_texts: List[str]) -> List[float]:
    """Compute TF-IDF cosine similarity between idea and candidates (pure Python)."""
    if not candidate_texts:
        return []
    vectors = _tfidf_vectors([idea_text] + candidate_texts)
    idea_vec = vectors[0]
    return [_cosine_sparse(idea_vec, v) for v in vectors[1:]]


def recommend_mentors(db: Session, idea: StartupIdea, top_k: int = 5) -> List[Dict[str, Any]]:
    """Recommend mentors based on expertise match with startup idea."""
    mentors = db.query(Mentor, User).join(User, Mentor.user_id == User.id).all()
    if not mentors:
        return []

    idea_text = _build_idea_text(idea)

    candidate_texts = []
    for mentor, user in mentors:
        parts = []
        if mentor.expertise:
            parts.extend(mentor.expertise)
        if mentor.industries:
            parts.extend(mentor.industries)
        if mentor.bio:
            parts.append(mentor.bio)
        if user.bio:
            parts.append(user.bio)
        candidate_texts.append(" ".join(parts).lower())

    similarities = _compute_similarity(idea_text, candidate_texts)

    results = []
    for i, (mentor, user) in enumerate(mentors):
        score = round(similarities[i] * 100, 1) if i < len(similarities) else 0
        results.append({
            "id": str(mentor.id),
            "user_id": str(mentor.user_id),
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "expertise": mentor.expertise,
            "industries": mentor.industries,
            "company": mentor.company,
            "job_title": mentor.job_title,
            "years_experience": mentor.years_experience,
            "availability": mentor.availability.value if mentor.availability else "available",
            "rating": mentor.rating,
            "match_score": score,
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:top_k]


def recommend_investors(db: Session, idea: StartupIdea, top_k: int = 5) -> List[Dict[str, Any]]:
    """Recommend investors based on focus area match with startup idea."""
    investors = db.query(Investor, User).join(User, Investor.user_id == User.id).all()
    if not investors:
        return []

    idea_text = _build_idea_text(idea)

    candidate_texts = []
    for investor, user in investors:
        parts = []
        if investor.investment_focus:
            parts.extend(investor.investment_focus)
        if investor.preferred_stage:
            parts.append(investor.preferred_stage)
        if investor.bio:
            parts.append(investor.bio)
        if user.bio:
            parts.append(user.bio)
        candidate_texts.append(" ".join(parts).lower())

    similarities = _compute_similarity(idea_text, candidate_texts)

    results = []
    for i, (investor, user) in enumerate(investors):
        score = round(similarities[i] * 100, 1) if i < len(similarities) else 0
        results.append({
            "id": str(investor.id),
            "user_id": str(investor.user_id),
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "investment_focus": investor.investment_focus,
            "fund_name": investor.fund_name,
            "preferred_stage": investor.preferred_stage,
            "min_investment": float(investor.min_investment) if investor.min_investment else None,
            "max_investment": float(investor.max_investment) if investor.max_investment else None,
            "match_score": score,
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:top_k]


def recommend_partners(db: Session, idea: StartupIdea, top_k: int = 5) -> List[Dict[str, Any]]:
    """Recommend industry partners based on capability/industry match with startup idea."""
    partners = db.query(Partner, User).join(User, Partner.user_id == User.id).all()
    if not partners:
        return []

    idea_text = _build_idea_text(idea)

    candidate_texts = []
    for partner, user in partners:
        parts = []
        if partner.partnership_types:
            parts.extend(partner.partnership_types)
        if partner.industries:
            parts.extend(partner.industries)
        if partner.capabilities:
            parts.extend(partner.capabilities)
        if partner.preferred_stage:
            parts.append(partner.preferred_stage)
        if partner.bio:
            parts.append(partner.bio)
        if user.bio:
            parts.append(user.bio)
        candidate_texts.append(" ".join(parts).lower())

    similarities = _compute_similarity(idea_text, candidate_texts)

    results = []
    for i, (partner, user) in enumerate(partners):
        score = round(similarities[i] * 100, 1) if i < len(similarities) else 0
        results.append(
            {
                "id": str(partner.id),
                "user_id": str(partner.user_id),
                "full_name": user.full_name,
                "avatar_url": user.avatar_url,
                "organization": partner.organization,
                "job_title": partner.job_title,
                "partnership_types": partner.partnership_types,
                "industries": partner.industries,
                "capabilities": partner.capabilities,
                "preferred_stage": partner.preferred_stage,
                "years_experience": partner.years_experience,
                "website": partner.website,
                "match_score": score,
            }
        )

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:top_k]
