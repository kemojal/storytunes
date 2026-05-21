"""Account & data self-service (GDPR): export and delete (PDD §37)."""

from datetime import UTC, datetime

from fastapi import APIRouter, Response
from sqlalchemy import delete, select, text

from app.api.deps import CurrentUser, Db
from app.models.business import Order

router = APIRouter(prefix="/me", tags=["account"])


@router.get("/export")
def export_my_data(db: Db, user: CurrentUser) -> dict:
    """Return everything we hold for the signed-in user (data portability)."""
    orders = list(db.execute(select(Order).where(Order.user_id == user.id)).scalars())
    return {
        "exported_at": datetime.now(UTC).isoformat(),
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role},
        "orders": [
            {
                "order_number": o.order_number,
                "status": o.status,
                "recipient_name": o.recipient_name,
                "relationship": o.relationship,
                "occasion": o.occasion,
                "story": o.story,
                "package_type": o.package_type,
                "price_cents": o.price_cents,
                "created_at": o.created_at.isoformat() if o.created_at else None,
            }
            for o in orders
        ],
    }


@router.delete("/", status_code=204)
def delete_my_account(db: Db, user: CurrentUser) -> Response:
    """Erase the user's account + all their data (right to be forgotten)."""
    uid = user.id
    # children without cascade first, then orders (cascades lyrics/files/events/
    # revisions), then auth rows, then the user.
    db.execute(text("DELETE FROM email_logs WHERE user_id = :u"), {"u": uid})
    db.execute(delete(Order).where(Order.user_id == uid))
    db.execute(text('DELETE FROM "account" WHERE user_id = :u'), {"u": uid})
    db.execute(text('DELETE FROM "session" WHERE user_id = :u'), {"u": uid})
    db.execute(text('DELETE FROM "user" WHERE id = :u'), {"u": uid})
    db.commit()
    return Response(status_code=204)
