"""Background jobs (PDD §24). Each task opens its own DB session."""

from app.db.session import SessionLocal
from app.models.business import Lyrics, Order, OrderEvent, SongBrief
from app.services import ai
from app.services.email import send_email
from app.workers.celery_app import celery


def _log(db, order_id: str, event_type: str, message: str | None = None) -> None:
    db.add(OrderEvent(order_id=order_id, event_type=event_type, message=message))


@celery.task(name="app.workers.tasks.start_production_pipeline")
def start_production_pipeline(order_id: str) -> None:
    """Kicked off after payment confirmation. Drives the first AI steps."""
    with SessionLocal() as db:
        order = db.get(Order, order_id)
        if order is None:
            return
        order.status = "story_review"
        _log(db, order_id, "production_started")
        db.commit()

    send_order_confirmation_email.delay(order_id)
    generate_song_brief.delay(order_id)


@celery.task(name="app.workers.tasks.generate_song_brief")
def generate_song_brief(order_id: str) -> None:
    with SessionLocal() as db:
        order = db.get(Order, order_id)
        if order is None:
            return
        brief_data = ai.generate_song_brief(order)
        db.add(
            SongBrief(
                order_id=order_id,
                title_ideas=brief_data["song_title_ideas"],
                emotional_arc=brief_data["emotional_arc"],
                must_include=brief_data["must_include"],
                must_avoid=brief_data["must_avoid"],
                recommended_structure=brief_data["recommended_structure"],
                raw_ai_output=brief_data,
            )
        )
        order.status = "lyrics_generation"
        _log(db, order_id, "brief_generated")
        db.commit()
    generate_lyrics.delay(order_id)


@celery.task(name="app.workers.tasks.generate_lyrics")
def generate_lyrics(order_id: str) -> None:
    with SessionLocal() as db:
        order = db.get(Order, order_id)
        if order is None:
            return
        brief = (
            db.query(SongBrief).filter(SongBrief.order_id == order_id).first()
        )
        text = ai.generate_lyrics(order, brief.raw_ai_output if brief else {})
        db.add(Lyrics(order_id=order_id, lyrics_text=text, generated_by="ai"))
        order.status = "lyrics_review"  # hand off to human admin (PDD §15.5)
        _log(db, order_id, "lyrics_generated")
        db.commit()


@celery.task(name="app.workers.tasks.send_order_confirmation_email")
def send_order_confirmation_email(order_id: str) -> None:
    with SessionLocal() as db:
        order = db.get(Order, order_id)
        if order is None or order.user_id is None:
            return
        send_email(
            to="customer@example.com",  # TODO: load from user; placeholder for scaffold
            subject=f"We received your StoryTunes order {order.order_number}",
            html=f"<p>Thanks! Your custom song for {order.recipient_name} is in production.</p>",
        )
        _log(db, order_id, "confirmation_email_sent")
        db.commit()
