"""Admin/production endpoints (PDD §13). All require a non-customer role."""

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select

from app.api.deps import AdminUser, Db
from app.models.business import Order, OrderEvent
from app.schemas.order import OrderOut, StatusUpdate
from app.workers import tasks

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/orders", response_model=list[OrderOut])
def list_orders(db: Db, _: AdminUser, status: str | None = Query(default=None)) -> list[Order]:
    stmt = select(Order).order_by(Order.created_at.desc())
    if status:
        stmt = stmt.where(Order.status == status)
    return list(db.execute(stmt).scalars())


@router.get("/orders/{order_id}", response_model=OrderOut)
def get_order(order_id: str, db: Db, _: AdminUser) -> Order:
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(404, "Order not found")
    return order


@router.patch("/orders/{order_id}/status", response_model=OrderOut)
def update_status(order_id: str, payload: StatusUpdate, db: Db, admin: AdminUser) -> Order:
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(404, "Order not found")
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


@router.post("/orders/{order_id}/generate-brief")
def generate_brief(order_id: str, db: Db, _: AdminUser) -> dict:
    if db.get(Order, order_id) is None:
        raise HTTPException(404, "Order not found")
    tasks.generate_song_brief.delay(order_id)
    return {"status": "queued"}


@router.post("/orders/{order_id}/generate-lyrics")
def generate_lyrics(order_id: str, db: Db, _: AdminUser) -> dict:
    if db.get(Order, order_id) is None:
        raise HTTPException(404, "Order not found")
    tasks.generate_lyrics.delay(order_id)
    return {"status": "queued"}
