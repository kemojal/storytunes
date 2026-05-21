"""Content moderation (PDD §31).

Two-stage: a cheap keyword prefilter, then a Gemini safety classifier. Designed
to keep humans out of the loop on clean orders — only flagged items get routed
to admin review. Fail-open (allow + log) if the classifier errors, so the
service never hard-blocks legitimate orders on an AI outage.
"""

import logging

from app.core.config import settings
from app.models.business import Order
from app.services import ai

log = logging.getLogger("storytunes.moderation")

# Minimal prefilter for obvious disallowed terms (kept short on purpose; the
# LLM classifier handles nuance). Word-boundary-ish substring match.
_BLOCK_TERMS = (
    " kill ",
    " rape",
    "child porn",
    "cp ",
    "nazi",
    "heil hitler",
)


def _prefilter(text: str) -> list[str]:
    low = f" {text.lower()} "
    return [t.strip() for t in _BLOCK_TERMS if t in low]


def moderate_text(text: str) -> dict:
    """Return {allowed: bool, categories: [str], reason: str}."""
    if not text or not text.strip():
        return {"allowed": True, "categories": [], "reason": ""}

    hits = _prefilter(text)
    if hits:
        return {"allowed": False, "categories": ["blocked_terms"], "reason": ", ".join(hits)}

    if not settings.moderation_enabled or not settings.has_gemini:
        return {"allowed": True, "categories": [], "reason": "moderation skipped"}

    prompt = (
        "You are a strict content-safety classifier for a family-friendly, custom "
        "song gift service. "
        f"{ai.INJECTION_GUARD}\n\n"
        "Flag the content if it requests or contains any of: hate or harassment; "
        "threats or extreme violence; sexual or explicit content; any sexual content "
        "involving minors; doxxing or exposing private personal data; impersonation "
        "of a real person without consent; defamation; copying, cloning, or imitating "
        "a real/known artist, their voice, or a copyrighted song; or other illegal "
        "content.\n\n"
        f"<content>\n{text}\n</content>\n\n"
        'Return JSON: {"allowed": boolean, "categories": [string], "reason": string}. '
        "Be permissive of ordinary heartfelt, romantic, or emotional family content."
    )
    try:
        data = ai.gen_json(prompt, temperature=0, max_output_tokens=256)
        return {
            "allowed": bool(data.get("allowed", True)),
            "categories": list(data.get("categories", []) or []),
            "reason": str(data.get("reason", "") or ""),
        }
    except Exception:  # noqa: BLE001 - fail open, never hard-block on AI error
        log.exception("moderation classifier failed; allowing by default")
        return {"allowed": True, "categories": [], "reason": "moderation unavailable"}


def moderate_order(order: Order) -> dict:
    """Screen the customer-provided fields of an order before generation."""
    text = "\n".join(
        str(v)
        for v in [
            order.recipient_name,
            order.relationship,
            order.occasion,
            order.story,
            order.favorite_memories,
            order.how_they_met,
            order.what_makes_them_special,
            order.inside_jokes,
            order.important_dates_places,
            order.challenges,
            order.things_to_avoid,
        ]
        if v
    )
    return moderate_text(text)
