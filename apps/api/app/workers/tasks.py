"""Background jobs (PDD §24). Each task opens its own DB session."""

import logging

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.auth import User
from app.models.business import Artist, Lyrics, Order, OrderEvent, SongBrief, SongFile
from app.services import ai, music
from app.workers.celery_app import celery

log = logging.getLogger("storytunes.tasks")


def _email_context(db, order: Order) -> tuple[str | None, str | None, str]:
    """(customer_email, customer_name, artist_name) for artist-voiced emails."""
    user = db.get(User, order.user_id) if order.user_id else None
    artist_name = settings.email_artist_name
    if order.artist_id:
        artist = db.get(Artist, order.artist_id)
        if artist:
            artist_name = artist.name
    return (
        user.email if user else None,
        user.name if user else None,
        artist_name,
    )


def _log(db, order_id: str, event_type: str, message: str | None = None) -> None:
    db.add(OrderEvent(order_id=order_id, event_type=event_type, message=message))


def _safe_email(db, *, order_id, user_id, email, email_type, subject, html) -> None:
    """Send + record an email; never raise (PDD §38 resilience)."""
    from app.models.business import EmailLog
    from app.services.email import send_email

    status, msg_id, err = "sent", None, None
    try:
        msg_id = send_email(to=email, subject=subject, html=html)
    except Exception as e:  # noqa: BLE001
        status, err = "failed", str(e)
        log.warning("email %s -> %s failed: %s", email_type, email, err)
    db.add(
        EmailLog(
            order_id=order_id,
            user_id=user_id,
            email_type=email_type,
            recipient_email=email,
            subject=subject,
            status=status,
            provider_message_id=msg_id,
        )
    )
    _log(db, order_id, f"{email_type}_{status}", err)


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
        brief = db.query(SongBrief).filter(SongBrief.order_id == order_id).first()
        result = ai.generate_lyrics(order, brief.raw_ai_output if brief else {})
        db.add(
            Lyrics(
                order_id=order_id,
                title=result["title"],
                lyrics_text=result["lyrics_text"],
                generated_by="ai",
            )
        )
        order.status = "lyrics_review"  # hand off to human admin (PDD §15.5)
        _log(db, order_id, "lyrics_generated")
        db.commit()


@celery.task(name="app.workers.tasks.generate_song_audio")
def generate_song_audio(order_id: str) -> None:
    """Generate the song audio from approved lyrics, then store + register it.

    Triggered after an admin approves lyrics (status -> music_generation).
    """
    with SessionLocal() as db:
        order = db.get(Order, order_id)
        if order is None:
            return
        lyrics = (
            db.query(Lyrics)
            .filter(Lyrics.order_id == order_id)
            .order_by(Lyrics.version.desc())
            .first()
        )
        lyrics_text = lyrics.lyrics_text if lyrics else ""
        title = (lyrics.title if lyrics else None) or f"Song for {order.recipient_name}"
        prompt = ai.build_music_prompt(order, lyrics_text)

    # Generation can be slow / hit the network — do it outside the txn.
    # Failure is non-fatal: an admin can upload the final audio manually
    # (PDD §34 — MVP production can be semi-manual).
    try:
        file_fields = music.generate_and_store(order_id, prompt, lyrics=lyrics_text, title=title)
    except Exception as e:  # noqa: BLE001
        log.warning("music generation failed for %s: %s", order_id, e)
        with SessionLocal() as db:
            _log(db, order_id, "music_generation_failed", str(e)[:300])
            db.commit()
        return

    with SessionLocal() as db:
        db.add(SongFile(order_id=order_id, version=1, **file_fields))
        order = db.get(Order, order_id)
        if order:
            order.status = "audio_review"  # human can review, then deliver
        _log(db, order_id, "audio_generated")
        db.commit()


@celery.task(name="app.workers.tasks.send_order_confirmation_email")
def send_order_confirmation_email(order_id: str) -> None:
    with SessionLocal() as db:
        order = db.get(Order, order_id)
        if order is None:
            return
        email, customer_name, artist_name = _email_context(db, order)
        if not email:
            return
        from app.services.email_templates import confirmation_email

        subject, html = confirmation_email(
            customer_name=customer_name,
            artist_name=artist_name,
            recipient_name=order.recipient_name,
            occasion=order.occasion,
            order_number=order.order_number,
        )
        _safe_email(
            db,
            order_id=order_id,
            user_id=order.user_id,
            email=email,
            email_type="order_confirmation",
            subject=subject,
            html=html,
        )
        db.commit()


@celery.task(name="app.workers.tasks.send_song_delivery_email")
def send_song_delivery_email(order_id: str, share_url: str) -> None:
    with SessionLocal() as db:
        order = db.get(Order, order_id)
        if order is None:
            return
        email, customer_name, artist_name = _email_context(db, order)
        if not email:
            return
        from app.services.email_templates import delivery_email

        subject, html = delivery_email(
            customer_name=customer_name,
            artist_name=artist_name,
            recipient_name=order.recipient_name,
            occasion=order.occasion,
            share_url=share_url,
        )
        _safe_email(
            db,
            order_id=order_id,
            user_id=order.user_id,
            email=email,
            email_type="song_delivery",
            subject=subject,
            html=html,
        )
        db.commit()
