"""Purge test/demo data before going live.

Removes the flow-test user and (optionally) the demo-customer + their orders.

    DATABASE_URL=... uv run python -m scripts.cleanup_test_data            # flowtest only
    DATABASE_URL=... INCLUDE_DEMO=1 uv run python -m scripts.cleanup_test_data  # + demo-customer
"""

import os

from sqlalchemy import delete, text

from app.db.session import SessionLocal
from app.models.business import Order

TEST_USER_IDS = ["flowtest_user", "custcheck", "admincheck", "chk"]


def _purge_user(db, uid: str) -> int:
    db.execute(text("DELETE FROM email_logs WHERE user_id = :u"), {"u": uid})
    n = db.execute(delete(Order).where(Order.user_id == uid)).rowcount
    db.execute(text('DELETE FROM "account" WHERE user_id = :u'), {"u": uid})
    db.execute(text('DELETE FROM "session" WHERE user_id = :u'), {"u": uid})
    db.execute(text('DELETE FROM "user" WHERE id = :u'), {"u": uid})
    return n


def main() -> None:
    ids = list(TEST_USER_IDS)
    if os.environ.get("INCLUDE_DEMO"):
        ids.append("demo-customer")
    with SessionLocal() as db:
        for uid in ids:
            removed = _purge_user(db, uid)
            print(f"purged {uid}: {removed} orders")
        db.commit()
    print("cleanup complete.")


if __name__ == "__main__":
    main()
