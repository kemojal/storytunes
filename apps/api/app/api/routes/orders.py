import secrets
from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.api.deps import CurrentUser, Db
from app.models.business import Order
from app.schemas.order import OrderDraftCreate, OrderOut, OrderUpdate
from app.services.pricing import expected_delivery, price_for

router = APIRouter(prefix="/orders", tags=["orders"])


def _order_number() -> str:
    stamp = datetime.now(UTC).strftime("%y%m%d")
    return f"ST-{stamp}-{secrets.token_hex(3).upper()}"


@router.post("/draft", response_model=OrderOut, status_code=201)
def create_draft(payload: OrderDraftCreate, db: Db, user: CurrentUser) -> Order:
    order = Order(
        **payload.model_dump(),
        user_id=user.id,
        order_number=_order_number(),
        status="draft",
        price_cents=price_for(payload.package_type),
        expected_delivery_date=expected_delivery(
            payload.package_type, payload.delivery_speed
        ),
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=list[OrderOut])
def list_my_orders(db: Db, user: CurrentUser) -> list[Order]:
    return list(
        db.execute(
            select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc())
        ).scalars()
    )


def _owned_order(db: Db, order_id: str, user: CurrentUser) -> Order:
    order = db.get(Order, order_id)
    if order is None or order.user_id != user.id:
        raise HTTPException(404, "Order not found")
    return order


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: str, db: Db, user: CurrentUser) -> Order:
    return _owned_order(db, order_id, user)


@router.patch("/{order_id}", response_model=OrderOut)
def update_order(order_id: str, payload: OrderUpdate, db: Db, user: CurrentUser) -> Order:
    order = _owned_order(db, order_id, user)
    if order.status not in ("draft", "pending_payment"):
        raise HTTPException(409, "Order can no longer be edited")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(order, key, value)
    if "package_type" in data or "delivery_speed" in data:
        order.price_cents = price_for(order.package_type)
        order.expected_delivery_date = expected_delivery(
            order.package_type, order.delivery_speed
        )
    db.commit()
    db.refresh(order)
    return order


@router.post("/{order_id}/submit", response_model=OrderOut)
def submit_order(order_id: str, db: Db, user: CurrentUser) -> Order:
    """Lock the draft and mark it awaiting payment. Checkout happens in web."""
    order = _owned_order(db, order_id, user)
    if order.status != "draft":
        raise HTTPException(409, "Order already submitted")
    order.status = "pending_payment"
    db.commit()
    db.refresh(order)
    return order
