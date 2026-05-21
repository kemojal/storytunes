"""End-to-end flow test against a running api (default http://localhost:8008).

Exercises the full order lifecycle over HTTP:
  signup(seed user+session) -> create order -> pay (stripe event) ->
  AI brief+lyrics -> approve lyrics -> AI music -> deliver -> share page.

Requires CELERY_EAGER=true on the server so pipeline tasks run inline.

    DATABASE_URL=... uv run python -m scripts.flow_test
"""

import os
import secrets
import sys
from datetime import UTC, datetime, timedelta

import httpx

from app.db.session import SessionLocal
from app.models.auth import Session as AuthSession
from app.models.auth import User

BASE = os.environ.get("API_BASE", "http://localhost:8008")
INTERNAL_KEY = os.environ.get("INTERNAL_API_KEY", "dev_internal_key_change_me")
TEST_EMAIL = os.environ.get("TEST_EMAIL", "kemo3855@gmail.com")

PASS, FAIL = "✅", "❌"
failures = 0


def check(label: str, cond: bool, detail: str = "") -> None:
    global failures
    print(f"{PASS if cond else FAIL} {label}{(' — ' + detail) if detail else ''}")
    if not cond:
        failures += 1


def seed_user_session() -> str:
    """Create an admin user + a session token, return the token."""
    token = "flowtest_" + secrets.token_hex(8)
    now = datetime.now(UTC).replace(tzinfo=None)
    with SessionLocal() as db:
        user = db.get(User, "flowtest_user")
        if not user:
            user = User(id="flowtest_user", name="Flow Tester", created_at=now, updated_at=now)
            db.add(user)
        user.email = TEST_EMAIL
        user.role = "super_admin"
        user.email_verified = True
        db.flush()  # ensure user row exists before session FK
        db.add(
            AuthSession(
                id=secrets.token_hex(8),
                token=token,
                user_id=user.id,
                expires_at=now + timedelta(days=1),
                created_at=now,
                updated_at=now,
            )
        )
        db.commit()
    return token


ORDER_PAYLOAD = {
    "recipient_name": "Maya",
    "recipient_nickname": "May",
    "mention_name_preference": "nickname",
    "relationship": "wife",
    "occasion": "anniversary",
    "is_surprise": True,
    "genre": "rnb",
    "mood": ["romantic", "nostalgic"],
    "tempo": "slow",
    "song_length": "standard",
    "story": (
        "We met in Taiwan at a small coffee shop five years ago, "
        "bonded over mango smoothies and rainy walks."
    ),
    "favorite_memories": "Rainy walks, mango smoothies, late-night talks.",
    "inside_jokes": "She calls me stubborn.",
    "things_to_avoid": "Do not make it too sad.",
    "desired_feelings": ["loved", "seen"],
    "package_type": "signature",
    "delivery_speed": "standard",
}


def main() -> None:
    token = seed_user_session()
    auth = {"Authorization": f"Bearer {token}"}
    internal = {"x-internal-key": INTERNAL_KEY}
    c = httpx.Client(base_url=BASE, timeout=180)

    # 0. health
    check("health/db", c.get("/api/health/db").json().get("db") == "reachable")

    # 1. create order (internal, on the user's behalf)
    r = c.post(
        "/api/internal/orders", headers=internal, json={**ORDER_PAYLOAD, "user_id": "flowtest_user"}
    )
    check("create order", r.status_code == 201, f"{r.status_code} {r.text[:120]}")
    order = r.json()
    oid = order["id"]
    print(f"   order {order['order_number']} price={order['price_cents']}")

    # 2. pay -> stripe webhook event -> pipeline (brief + lyrics + confirmation email)
    evt = {
        "id": "evt_" + secrets.token_hex(6),
        "type": "checkout.session.completed",
        "data": {
            "object": {"id": "cs_test", "payment_intent": "pi_test", "metadata": {"order_id": oid}}
        },
    }
    r = c.post("/api/internal/stripe-events", headers=internal, json=evt)
    check("pay (stripe event)", r.status_code == 200, r.text[:120])

    # 3. detail -> lyrics generated
    d = c.get(f"/api/orders/{oid}/detail", headers=auth).json()
    # With automation + eager Celery the pipeline may run to completion inline.
    check(
        "status advanced past paid",
        d["status"] not in ("paid", "pending_payment", "draft"),
        d["status"],
    )
    has_lyrics = len(d["lyrics"]) > 0
    check("lyrics generated", has_lyrics)
    if has_lyrics:
        text = d["lyrics"][0]["lyrics_text"]
        is_real = "Set GEMINI_API_KEY" not in text and "Placeholder" not in text
        print(f"   lyrics title: {d['lyrics'][0].get('title')!r}")
        print("   --- lyrics preview ---")
        print("   " + "\n   ".join(text.splitlines()[:8]))
        check(
            "lyrics are real Gemini output (not stub)",
            is_real,
            "stub fallback — set GEMINI_API_KEY for live",
        )

    # 4. approve lyrics -> music generation
    r = c.post(f"/api/admin/orders/{oid}/approve-lyrics", headers=auth)
    check("approve lyrics", r.status_code == 200, r.text[:120])

    d = c.get(f"/api/orders/{oid}/detail", headers=auth).json()
    finals = [f for f in d["files"] if f["is_final"]]
    check("audio file produced", len(finals) > 0, f"status={d['status']}")

    # 5. deliver -> share token + delivery email
    r = c.post(f"/api/admin/orders/{oid}/deliver", headers=auth, json={"message": "Enjoy!"})
    check("deliver", r.status_code == 200, r.text[:160])
    share_token = r.json().get("share_token") if r.status_code == 200 else None

    # 6. public share page
    if share_token:
        s = c.get(f"/api/share/{share_token}")
        check("share page reachable", s.status_code == 200, s.text[:120])
        if s.status_code == 200:
            sp = s.json()
            check("share page has audio file", len(sp["files"]) > 0)
            check("share page has lyrics", bool(sp.get("lyrics_text")))
            print(f"   share files: {[f['url'][:60] for f in sp['files']]}")

    print()
    if failures:
        print(f"{FAIL} {failures} check(s) failed")
        sys.exit(1)
    print(f"{PASS} full flow passed")


if __name__ == "__main__":
    main()
