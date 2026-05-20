"""AI songwriting pipeline stubs (PDD §15-17).

These are deterministic placeholders so the pipeline wiring (Celery -> status
transitions -> emails) is testable today. Swap the bodies for real LLM /
music-generation calls in Phase 2/3.
"""

from app.models.business import Order


def generate_song_brief(order: Order) -> dict:
    return {
        "song_title_ideas": [f"For {order.recipient_name}"],
        "emotional_arc": "warm opening, heartfelt chorus, intimate close",
        "must_include": [order.occasion, order.relationship],
        "must_avoid": [order.things_to_avoid] if order.things_to_avoid else [],
        "recommended_structure": ["Verse 1", "Chorus", "Verse 2", "Bridge", "Final Chorus"],
    }


def generate_lyrics(order: Order, brief: dict) -> str:
    return (
        f"[Placeholder lyrics for {order.recipient_name} — {order.occasion}]\n"
        "Replace app.services.ai.generate_lyrics with a real LLM call."
    )


def build_music_prompt(order: Order, lyrics: str) -> str:
    return (
        f"Create a custom {order.occasion} song.\n"
        f"Genre: {order.genre}\nMood: {', '.join(order.mood or [])}\n"
        f"Tempo: {order.tempo}\nLyrics:\n{lyrics}\n\n"
        "Rules: do not imitate any real artist; no copyrighted melodies; "
        "no explicit lyrics; sincere and personal."
    )
