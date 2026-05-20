"""Seed a handful of demo orders (various statuses) for the admin dashboard.

Idempotent: clears prior demo rows (user_id='demo-customer') then reinserts.

    DATABASE_URL=... uv run python -m scripts.seed_demo_orders
"""

import secrets
from datetime import UTC, date, datetime, timedelta

from sqlalchemy import delete, select

from app.db.session import SessionLocal
from app.models.auth import User
from app.models.business import Artist, Lyrics, Order, OrderEvent, Revision, SongFile
from app.services.pricing import price_for

DEMO_USER = "demo-customer"
SAMPLE_MP3 = "https://download.samplelib.com/mp3/sample-12s.mp3"
NOW = datetime.now(UTC).replace(tzinfo=None)


def _n(i: int) -> str:
    return f"ST-DEMO-{i:02d}"


# (recipient, relationship, occasion, artist_slug, package, status, *extras)
DEMOS = [
    dict(
        recipient="Maya",
        rel="wife",
        occ="anniversary",
        artist="maya",
        pkg="signature",
        status="paid",
    ),
    dict(
        recipient="Liam",
        rel="friend",
        occ="birthday",
        artist="zara",
        pkg="starter",
        status="lyrics_review",
        lyrics="draft",
    ),
    dict(
        recipient="The Garcias",
        rel="other",
        occ="wedding",
        artist="theo",
        pkg="premium",
        status="audio_review",
        lyrics="approved",
        final=True,
    ),
    dict(
        recipient="Mom",
        rel="mom",
        occ="mothers_day",
        artist="maya",
        pkg="signature",
        status="delivered",
        lyrics="approved",
        final=True,
        share=True,
    ),
    dict(
        recipient="Dad",
        rel="dad",
        occ="fathers_day",
        artist="theo",
        pkg="premium",
        status="revision_requested",
        lyrics="approved",
        final=True,
        share=True,
        revision=True,
    ),
]


def main() -> None:
    with SessionLocal() as db:
        # demo customer
        if not db.get(User, DEMO_USER):
            db.add(
                User(
                    id=DEMO_USER,
                    name="Demo Customer",
                    email="demo@storytunes.test",
                    role="customer",
                    email_verified=True,
                    created_at=NOW,
                    updated_at=NOW,
                )
            )
            db.flush()

        # clear previous demo orders (cascades lyrics/files/events/revisions)
        prev = list(db.execute(select(Order.id).where(Order.user_id == DEMO_USER)).scalars())
        if prev:
            db.execute(delete(Order).where(Order.user_id == DEMO_USER))
            db.flush()

        artists = {a.slug: a.id for a in db.execute(select(Artist)).scalars()}

        for i, d in enumerate(DEMOS, start=1):
            created = NOW - timedelta(days=len(DEMOS) - i)
            order = Order(
                user_id=DEMO_USER,
                artist_id=artists.get(d["artist"]),
                order_number=_n(i),
                recipient_name=d["recipient"],
                mention_name_preference="real_name",
                relationship=d["rel"],
                occasion=d["occ"],
                genre="acoustic_pop",
                mood=["romantic", "heartfelt"],
                tempo="medium",
                song_length="standard",
                story="We've shared a lifetime of small, perfect moments.",
                package_type=d["pkg"],
                delivery_speed="standard",
                expected_delivery_date=date.today() + timedelta(days=5),
                status=d["status"],
                payment_status="paid",
                price_cents=price_for(d["pkg"]),
                created_at=created,
                updated_at=created,
            )
            if d.get("share"):
                order.share_token = secrets.token_urlsafe(12)
            db.add(order)
            db.flush()

            ev = ["paid", "production_started"]
            if d.get("lyrics"):
                db.add(
                    Lyrics(
                        order_id=order.id,
                        version=1,
                        title=f"For {d['recipient']}",
                        lyrics_text="[Verse 1]\nEvery little moment, every quiet day…\n"
                        "[Chorus]\nYou're the song my heart keeps trying to say.",
                        status=d["lyrics"],
                        generated_by="ai",
                    )
                )
                ev += ["brief_generated", "lyrics_generated"]
                if d["lyrics"] == "approved":
                    ev.append("lyrics_approved")
            if d.get("final"):
                db.add(
                    SongFile(
                        order_id=order.id,
                        file_type="mp3",
                        file_url=SAMPLE_MP3,
                        storage_key=SAMPLE_MP3,
                        file_name=f"{d['recipient']}.mp3",
                        mime_type="audio/mpeg",
                        is_final=True,
                    )
                )
                ev.append("audio_generated")
            if d["status"] == "delivered" or d.get("share"):
                ev.append("delivered")
            if d.get("revision"):
                db.add(
                    Revision(
                        order_id=order.id,
                        requested_by=DEMO_USER,
                        revision_type="minor",
                        message="Could you add my dad's nickname, Pops?",
                        status="requested",
                    )
                )
                ev.append("revision_requested")

            for e in ev:
                db.add(OrderEvent(order_id=order.id, event_type=e, created_at=created))

            print(f"+ {order.order_number}  {d['status']:18}  {d['recipient']}")

        db.commit()
        print(f"\nSeeded {len(DEMOS)} demo orders.")


if __name__ == "__main__":
    main()
