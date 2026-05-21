"""Seed dev data: promote an admin, insert demo artists + samples.

Usage:
    # 1. sign up in the web app first (creates the better-auth user)
    # 2. promote that user to admin + load demo content:
    ADMIN_EMAIL=you@example.com uv run python -m scripts.seed
"""

import os

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.auth import User
from app.models.business import Artist, Sample

ARTISTS = [
    {
        "name": "Maya",
        "slug": "maya",
        "bio": "Warm, soulful, emotional.",
        "voice_description": "Soft female vocal, intimate, warm, cinematic.",
        "personality": "Tender and heartfelt.",
        "best_for": ["anniversaries", "weddings", "mothers_day", "romantic"],
        "genres": ["acoustic_pop", "rnb", "piano_ballad"],
    },
    {
        "name": "Theo",
        "slug": "theo",
        "bio": "Earthy, honest, folk-leaning.",
        "voice_description": "Warm male vocal, storytelling, acoustic.",
        "personality": "Grounded and sincere.",
        "best_for": ["fathers_day", "friendship", "tribute"],
        "genres": ["folk", "country", "soft_rock"],
    },
    {
        "name": "Zara",
        "slug": "zara",
        "bio": "Bright, celebratory, uplifting.",
        "voice_description": "Vibrant female vocal, joyful, modern.",
        "personality": "Energetic and warm.",
        "best_for": ["birthday", "graduation", "celebratory"],
        "genres": ["afrobeat", "pop_ballad", "gospel"],
    },
]

SAMPLES = [
    {
        "title": "Five Years of Us",
        "occasion": "anniversary",
        "mood": "romantic",
        "artist_name": "Maya",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "description": "A soft R&B ballad for a fifth anniversary.",
    },
    {
        "title": "Always Your Kid",
        "occasion": "fathers_day",
        "mood": "heartfelt",
        "artist_name": "Theo",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "description": "An acoustic folk tribute to dad.",
    },
    {
        "title": "Light The Candles",
        "occasion": "birthday",
        "mood": "joyful",
        "artist_name": "Zara",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        "description": "An upbeat afrobeat birthday anthem.",
    },
]


def main() -> None:
    with SessionLocal() as db:
        # promote admin
        admin_email = os.environ.get("ADMIN_EMAIL")
        if admin_email:
            user = db.execute(select(User).where(User.email == admin_email)).scalar_one_or_none()
            if user:
                user.role = "super_admin"
                print(f"Promoted {admin_email} -> super_admin")
            else:
                print(f"! No user with email {admin_email}; sign up first, then re-run.")

        # artists
        for a in ARTISTS:
            exists = db.execute(select(Artist).where(Artist.slug == a["slug"])).scalar_one_or_none()
            if not exists:
                db.add(Artist(**a))
                print(f"+ artist {a['name']}")

        # samples
        for s in SAMPLES:
            exists = db.execute(
                select(Sample).where(Sample.title == s["title"])
            ).scalar_one_or_none()
            if not exists:
                db.add(Sample(**s))
                print(f"+ sample {s['title']}")

        db.commit()
        print("Seed complete.")


if __name__ == "__main__":
    main()
