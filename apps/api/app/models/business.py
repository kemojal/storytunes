"""Business tables — owned and migrated by the api (Alembic). PDD §22."""

from datetime import date, datetime

from sqlalchemy import (
    ARRAY,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

# Order lifecycle (PDD §12). Stored as text for forward-compat.
ORDER_STATUSES = (
    "draft",
    "pending_payment",
    "paid",
    "story_review",
    "lyrics_generation",
    "lyrics_review",
    "music_generation",
    "audio_review",
    "ready_for_delivery",
    "delivered",
    "revision_requested",
    "revision_in_progress",
    "completed",
    "cancelled",
    "refunded",
)


def _uuid_pk() -> Mapped[str]:
    return mapped_column(
        UUID(as_uuid=False), primary_key=True, server_default=func.gen_random_uuid()
    )


class Artist(Base):
    __tablename__ = "artists"

    id: Mapped[str] = _uuid_pk()
    name: Mapped[str] = mapped_column(Text)
    slug: Mapped[str] = mapped_column(Text, unique=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    voice_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    personality: Mapped[str | None] = mapped_column(Text, nullable=True)
    best_for: Mapped[list[str] | None] = mapped_column(ARRAY(Text), nullable=True)
    genres: Mapped[list[str] | None] = mapped_column(ARRAY(Text), nullable=True)
    sample_audio_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = _uuid_pk()
    # FK to better-auth user (text id). No SQLAlchemy relationship across the
    # ownership boundary — load User explicitly when needed.
    user_id: Mapped[str | None] = mapped_column(ForeignKey("user.id"), nullable=True, index=True)
    artist_id: Mapped[str | None] = mapped_column(ForeignKey("artists.id"), nullable=True)
    order_number: Mapped[str] = mapped_column(Text, unique=True)

    recipient_name: Mapped[str] = mapped_column(Text)
    recipient_nickname: Mapped[str | None] = mapped_column(Text, nullable=True)
    mention_name_preference: Mapped[str] = mapped_column(Text)

    relationship: Mapped[str] = mapped_column(Text)
    occasion: Mapped[str] = mapped_column(Text)
    occasion_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_surprise: Mapped[bool] = mapped_column(Boolean, server_default="true")

    genre: Mapped[str | None] = mapped_column(Text, nullable=True)
    mood: Mapped[list[str] | None] = mapped_column(ARRAY(Text), nullable=True)
    tempo: Mapped[str | None] = mapped_column(Text, nullable=True)
    song_length: Mapped[str | None] = mapped_column(Text, nullable=True)

    story: Mapped[str | None] = mapped_column(Text, nullable=True)
    favorite_memories: Mapped[str | None] = mapped_column(Text, nullable=True)
    how_they_met: Mapped[str | None] = mapped_column(Text, nullable=True)
    what_makes_them_special: Mapped[str | None] = mapped_column(Text, nullable=True)
    inside_jokes: Mapped[str | None] = mapped_column(Text, nullable=True)
    important_dates_places: Mapped[str | None] = mapped_column(Text, nullable=True)
    challenges: Mapped[str | None] = mapped_column(Text, nullable=True)
    desired_feelings: Mapped[list[str] | None] = mapped_column(ARRAY(Text), nullable=True)
    things_to_avoid: Mapped[str | None] = mapped_column(Text, nullable=True)

    package_type: Mapped[str] = mapped_column(Text)
    delivery_speed: Mapped[str] = mapped_column(Text)
    expected_delivery_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    status: Mapped[str] = mapped_column(Text, server_default="pending_payment", index=True)

    price_cents: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(Text, server_default="usd")

    stripe_checkout_session_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    stripe_payment_intent_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    payment_status: Mapped[str] = mapped_column(Text, server_default="unpaid")

    # private share-page token (PDD §27)
    share_token: Mapped[str | None] = mapped_column(Text, unique=True, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class SongBrief(Base):
    __tablename__ = "song_briefs"

    id: Mapped[str] = _uuid_pk()
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    title_ideas: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    emotional_arc: Mapped[str | None] = mapped_column(Text, nullable=True)
    must_include: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    must_avoid: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    recommended_structure: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    raw_ai_output: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    approved: Mapped[bool] = mapped_column(Boolean, server_default="false")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Lyrics(Base):
    __tablename__ = "lyrics"

    id: Mapped[str] = _uuid_pk()
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    version: Mapped[int] = mapped_column(Integer, server_default="1")
    title: Mapped[str | None] = mapped_column(Text, nullable=True)
    lyrics_text: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text, server_default="draft")
    generated_by: Mapped[str | None] = mapped_column(Text, nullable=True)
    approved_by: Mapped[str | None] = mapped_column(ForeignKey("user.id"), nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class SongFile(Base):
    __tablename__ = "song_files"

    id: Mapped[str] = _uuid_pk()
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    file_type: Mapped[str] = mapped_column(Text)  # mp3 | wav | lyrics_pdf | cover
    file_url: Mapped[str] = mapped_column(Text)
    storage_key: Mapped[str] = mapped_column(Text)
    file_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    mime_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    version: Mapped[int] = mapped_column(Integer, server_default="1")
    is_final: Mapped[bool] = mapped_column(Boolean, server_default="false")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Revision(Base):
    __tablename__ = "revisions"

    id: Mapped[str] = _uuid_pk()
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    requested_by: Mapped[str | None] = mapped_column(ForeignKey("user.id"), nullable=True)
    revision_type: Mapped[str | None] = mapped_column(Text, nullable=True)  # minor|major
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text, server_default="requested")
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class OrderEvent(Base):
    __tablename__ = "order_events"

    id: Mapped[str] = _uuid_pk()
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    event_type: Mapped[str] = mapped_column(Text)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    event_metadata: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_by: Mapped[str | None] = mapped_column(ForeignKey("user.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class EmailLog(Base):
    __tablename__ = "email_logs"

    id: Mapped[str] = _uuid_pk()
    order_id: Mapped[str | None] = mapped_column(ForeignKey("orders.id"), nullable=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("user.id"), nullable=True)
    email_type: Mapped[str] = mapped_column(Text)
    recipient_email: Mapped[str] = mapped_column(Text)
    subject: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text)
    provider_message_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class ProcessedStripeEvent(Base):
    """Idempotency ledger for Stripe events forwarded from web (PDD §38)."""

    __tablename__ = "processed_stripe_events"

    stripe_event_id: Mapped[str] = mapped_column(Text, primary_key=True)
    event_type: Mapped[str] = mapped_column(Text)
    processed_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Sample(Base):
    """Public showcase songs (PDD §10.4)."""

    __tablename__ = "samples"

    id: Mapped[str] = _uuid_pk()
    title: Mapped[str] = mapped_column(Text)
    occasion: Mapped[str | None] = mapped_column(Text, nullable=True)
    mood: Mapped[str | None] = mapped_column(Text, nullable=True)
    artist_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    audio_url: Mapped[str] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
