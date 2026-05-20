from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class LyricsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    version: int
    title: str | None
    lyrics_text: str
    status: str
    generated_by: str | None
    created_at: datetime


class LyricsUpdate(BaseModel):
    title: str | None = None
    lyrics_text: str | None = None
    status: str | None = None


class FileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    file_type: str
    file_name: str | None
    mime_type: str | None
    size_bytes: int | None
    version: int
    is_final: bool
    created_at: datetime


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    event_type: str
    message: str | None
    created_at: datetime


class OrderDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    order_number: str
    status: str
    payment_status: str
    recipient_name: str
    recipient_nickname: str | None
    relationship: str
    occasion: str
    occasion_date: date | None
    genre: str | None
    mood: list[str] | None
    tempo: str | None
    song_length: str | None
    story: str | None
    package_type: str
    delivery_speed: str
    artist_id: str | None
    price_cents: int
    currency: str
    expected_delivery_date: date | None
    share_token: str | None
    created_at: datetime
    lyrics: list[LyricsOut] = []
    files: list[FileOut] = []
    events: list[EventOut] = []


# ---- files ----
class PresignUploadIn(BaseModel):
    file_type: str  # mp3 | wav | lyrics_pdf | cover
    file_name: str
    mime_type: str
    is_final: bool = False


class PresignUploadOut(BaseModel):
    upload_url: str
    storage_key: str
    file_id: str


class DownloadUrlOut(BaseModel):
    url: str


# ---- revisions ----
class RevisionCreate(BaseModel):
    revision_type: str = "minor"  # minor | major
    message: str


class RevisionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    order_id: str
    revision_type: str | None
    message: str
    status: str
    admin_notes: str | None
    created_at: datetime


class RevisionUpdate(BaseModel):
    status: str | None = None
    admin_notes: str | None = None


# ---- admin ----
class NoteCreate(BaseModel):
    message: str


class DeliverIn(BaseModel):
    message: str | None = None


class DashboardStats(BaseModel):
    total_orders: int
    by_status: dict[str, int]
    revenue_cents: int
    open_revisions: int


# ---- public share page ----
class ShareFile(BaseModel):
    file_type: str
    file_name: str | None
    url: str


class SharePageOut(BaseModel):
    order_number: str
    recipient_name: str
    occasion: str
    title: str | None
    lyrics_text: str | None
    files: list[ShareFile] = []
