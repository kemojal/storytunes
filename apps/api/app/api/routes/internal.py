"""Service-to-service endpoint. Receives Stripe events already verified by web.

web (better-auth stripe plugin) verifies the signature, then forwards the event
here with X-Internal-Key. The api owns the orders table, so the order write
lives here. Idempotent on stripe_event_id (PDD §38).
"""

import secrets
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import Db, verify_internal_key
from app.models.business import Order, ProcessedStripeEvent
from app.schemas.order import InternalOrderCreate, OrderCreatedOut
from app.services.pricing import expected_delivery, price_for
from app.workers.tasks import start_production_pipeline

router = APIRouter(prefix="/internal", tags=["internal"])


def _order_number() -> str:
    return f"ST-{datetime.now(UTC).strftime('%y%m%d')}-{secrets.token_hex(3).upper()}"


class StripeEventIn(BaseModel):
    id: str
    type: str
    data: dict[str, Any]


@router.post(
    "/orders",
    response_model=OrderCreatedOut,
    status_code=201,
    dependencies=[Depends(verify_internal_key)],
)
def create_order_internal(payload: InternalOrderCreate, db: Db) -> Order:
    """Create an order on behalf of a user already verified by web.

    Price is computed here (single source of truth), then web opens a Stripe
    Checkout Session for `price_cents`.
    """
    fields = payload.model_dump(exclude={"addons"})
    order = Order(
        **fields,
        order_number=_order_number(),
        status="pending_payment",
        price_cents=price_for(payload.package_type, payload.addons),
        expected_delivery_date=expected_delivery(payload.package_type, payload.delivery_speed),
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def _order_for_session(db: Db, obj: dict) -> Order | None:
    # Prefer explicit metadata.order_id set when web created the session.
    order_id = (obj.get("metadata") or {}).get("order_id")
    if order_id:
        return db.get(Order, order_id)
    session_id = obj.get("id")
    if session_id:
        return db.query(Order).filter(Order.stripe_checkout_session_id == session_id).first()
    return None


@router.post("/stripe-events", dependencies=[Depends(verify_internal_key)])
def handle_stripe_event(event: StripeEventIn, db: Db) -> dict:
    # Idempotency guard.
    if db.get(ProcessedStripeEvent, event.id):
        return {"status": "duplicate"}

    obj = event.data.get("object", {})

    if event.type == "checkout.session.completed":
        order = _order_for_session(db, obj)
        if order is not None:
            order.payment_status = "paid"
            order.status = "paid"
            order.stripe_payment_intent_id = obj.get("payment_intent")
            db.add(ProcessedStripeEvent(stripe_event_id=event.id, event_type=event.type))
            db.commit()
            start_production_pipeline.delay(order.id)
            return {"status": "ok", "order_id": order.id}

    elif event.type == "charge.refunded":
        intent = obj.get("payment_intent")
        order = (
            db.query(Order).filter(Order.stripe_payment_intent_id == intent).first()
            if intent
            else None
        )
        if order is not None:
            order.payment_status = "refunded"
            order.status = "refunded"

    db.add(ProcessedStripeEvent(stripe_event_id=event.id, event_type=event.type))
    db.commit()
    return {"status": "ok"}
