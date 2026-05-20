from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class OrderDraftCreate(BaseModel):
    """Step-by-step wizard saves a draft; most fields optional until submit."""

    recipient_name: str
    mention_name_preference: str
    relationship: str
    occasion: str
    package_type: str
    delivery_speed: str

    recipient_nickname: str | None = None
    occasion_date: date | None = None
    is_surprise: bool = True
    artist_id: str | None = None

    genre: str | None = None
    mood: list[str] | None = None
    tempo: str | None = None
    song_length: str | None = None

    story: str | None = None
    favorite_memories: str | None = None
    how_they_met: str | None = None
    what_makes_them_special: str | None = None
    inside_jokes: str | None = None
    important_dates_places: str | None = None
    challenges: str | None = None
    desired_feelings: list[str] | None = None
    things_to_avoid: str | None = None


class OrderUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    # Partial update — every wizard field optional.
    recipient_name: str | None = None
    recipient_nickname: str | None = None
    mention_name_preference: str | None = None
    relationship: str | None = None
    occasion: str | None = None
    occasion_date: date | None = None
    is_surprise: bool | None = None
    artist_id: str | None = None
    genre: str | None = None
    mood: list[str] | None = None
    tempo: str | None = None
    song_length: str | None = None
    story: str | None = None
    favorite_memories: str | None = None
    how_they_met: str | None = None
    what_makes_them_special: str | None = None
    inside_jokes: str | None = None
    important_dates_places: str | None = None
    challenges: str | None = None
    desired_feelings: list[str] | None = None
    things_to_avoid: str | None = None
    package_type: str | None = None
    delivery_speed: str | None = None


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    order_number: str
    status: str
    payment_status: str
    recipient_name: str
    relationship: str
    occasion: str
    package_type: str
    delivery_speed: str
    artist_id: str | None
    price_cents: int
    currency: str
    expected_delivery_date: date | None
    created_at: datetime


class StatusUpdate(BaseModel):
    status: str
    message: str | None = None
