"""Admin/production endpoints (PDD §13). All require a non-customer role."""

import secrets

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import func, select

from app.api.deps import AdminUser, Db
from app.core.config import settings
from app.models.business import (
    Lyrics,
    Order,
    OrderEvent,
    Revision,
    SongFile,
)
from app.schemas.order import OrderOut, StatusUpdate
from app.schemas.production import (
    DashboardStats,
    DeliverIn,
    EventOut,
    FileOut,
    LyricsOut,
    LyricsUpdate,
    NoteCreate,
    OrderDetailOut,
    RevisionOut,
    RevisionUpdate,
)
from app.workers import tasks

router = APIRouter(prefix="/admin", tags=["admin"])


# ---- dashboard ----
@router.get("/dashboard", response_model=DashboardStats)
def dashboard(db: Db, _: AdminUser) -> DashboardStats:
    rows = db.execute(select(Order.status, func.count()).group_by(Order.status)).all()
    by_status = {status: count for status, count in rows}
    revenue = db.execute(
        select(func.coalesce(func.sum(Order.price_cents), 0)).where(Order.payment_status == "paid")
    ).scalar_one()
    open_revisions = db.execute(
        select(func.count()).select_from(Revision).where(Revision.status == "requested")
    ).scalar_one()
    return DashboardStats(
        total_orders=sum(by_status.values()),
        by_status=by_status,
        revenue_cents=int(revenue),
        open_revisions=int(open_revisions),
    )


# ---- orders ----
@router.get("/orders", response_model=list[OrderOut])
def list_orders(db: Db, _: AdminUser, status: str | None = Query(default=None)) -> list[Order]:
    stmt = select(Order).order_by(Order.created_at.desc())
    if status:
        stmt = stmt.where(Order.status == status)
    return list(db.execute(stmt).scalars())


def _get_order(db: Db, order_id: str) -> Order:
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(404, "Order not found")
    return order


@router.get("/orders/{order_id}", response_model=OrderDetailOut)
def get_order(order_id: str, db: Db, _: AdminUser) -> OrderDetailOut:
    order = _get_order(db, order_id)
    lyrics = (
        db.query(Lyrics).filter(Lyrics.order_id == order_id).order_by(Lyrics.version.desc()).all()
    )
    files = db.query(SongFile).filter(SongFile.order_id == order_id).all()
    events = (
        db.query(OrderEvent)
        .filter(OrderEvent.order_id == order_id)
        .order_by(OrderEvent.created_at.asc())
        .all()
    )
    detail = OrderDetailOut.model_validate(order)
    detail.lyrics = [LyricsOut.model_validate(x) for x in lyrics]
    detail.files = [FileOut.model_validate(x) for x in files]
    detail.events = [EventOut.model_validate(x) for x in events]
    return detail


@router.patch("/orders/{order_id}/status", response_model=OrderOut)
def update_status(order_id: str, payload: StatusUpdate, db: Db, admin: AdminUser) -> Order:
    order = _get_order(db, order_id)
    order.status = payload.status
    db.add(
        OrderEvent(
            order_id=order_id,
            event_type="status_changed",
            message=payload.message or payload.status,
            created_by=admin.id,
        )
    )
    db.commit()
    db.refresh(order)
    return order


@router.post("/orders/{order_id}/notes", status_code=201)
def add_note(order_id: str, payload: NoteCreate, db: Db, admin: AdminUser) -> dict:
    _get_order(db, order_id)
    db.add(
        OrderEvent(
            order_id=order_id, event_type="note", message=payload.message, created_by=admin.id
        )
    )
    db.commit()
    return {"status": "ok"}


# ---- production: brief / lyrics ----
@router.post("/orders/{order_id}/generate-brief")
def generate_brief(order_id: str, db: Db, _: AdminUser) -> dict:
    _get_order(db, order_id)
    tasks.generate_song_brief.delay(order_id)
    return {"status": "queued"}


@router.post("/orders/{order_id}/generate-lyrics")
def generate_lyrics(order_id: str, db: Db, _: AdminUser) -> dict:
    _get_order(db, order_id)
    tasks.generate_lyrics.delay(order_id)
    return {"status": "queued"}


@router.patch("/lyrics/{lyrics_id}", response_model=LyricsOut)
def edit_lyrics(lyrics_id: str, payload: LyricsUpdate, db: Db, _: AdminUser) -> Lyrics:
    lyrics = db.get(Lyrics, lyrics_id)
    if lyrics is None:
        raise HTTPException(404, "Lyrics not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(lyrics, k, v)
    db.commit()
    db.refresh(lyrics)
    return lyrics


@router.post("/orders/{order_id}/approve-lyrics", response_model=OrderOut)
def approve_lyrics(order_id: str, db: Db, admin: AdminUser) -> Order:
    order = _get_order(db, order_id)
    latest = (
        db.query(Lyrics).filter(Lyrics.order_id == order_id).order_by(Lyrics.version.desc()).first()
    )
    if latest is None:
        raise HTTPException(409, "No lyrics to approve")
    latest.status = "approved"
    latest.approved_by = admin.id
    order.status = "music_generation"
    db.add(OrderEvent(order_id=order_id, event_type="lyrics_approved", created_by=admin.id))
    db.commit()
    db.refresh(order)
    # Kick off AI music generation (PDD §16).
    tasks.generate_song_audio.delay(order_id)
    return order


# ---- delivery ----
@router.post("/orders/{order_id}/deliver", response_model=OrderOut)
def deliver(order_id: str, payload: DeliverIn, db: Db, admin: AdminUser) -> Order:
    order = _get_order(db, order_id)
    finals = (
        db.query(SongFile)
        .filter(SongFile.order_id == order_id, SongFile.is_final.is_(True))
        .count()
    )
    if finals == 0:
        raise HTTPException(409, "Upload at least one final file before delivering")
    if not order.share_token:
        order.share_token = secrets.token_urlsafe(16)
    order.status = "delivered"
    db.add(
        OrderEvent(
            order_id=order_id,
            event_type="delivered",
            message=payload.message,
            created_by=admin.id,
        )
    )
    db.commit()
    db.refresh(order)
    share_url = f"{settings.web_origin}/song/{order.share_token}"
    tasks.send_song_delivery_email.delay(order_id, share_url)
    return order


# ---- revisions ----
@router.get("/revisions", response_model=list[RevisionOut])
def list_revisions(
    db: Db, _: AdminUser, status: str | None = Query(default=None)
) -> list[Revision]:
    stmt = select(Revision).order_by(Revision.created_at.desc())
    if status:
        stmt = stmt.where(Revision.status == status)
    return list(db.execute(stmt).scalars())


@router.patch("/revisions/{revision_id}", response_model=RevisionOut)
def update_revision(revision_id: str, payload: RevisionUpdate, db: Db, _: AdminUser) -> Revision:
    rev = db.get(Revision, revision_id)
    if rev is None:
        raise HTTPException(404, "Revision not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(rev, k, v)
    db.commit()
    db.refresh(rev)
    return rev
