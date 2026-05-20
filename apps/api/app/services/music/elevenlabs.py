"""ElevenLabs Music provider. Returns raw audio bytes (stored to R2/local)."""

import httpx

from app.core.config import settings
from app.services.music import MusicProvider, MusicResult


class ElevenLabsProvider(MusicProvider):
    name = "elevenlabs"

    def generate(self, prompt: str, *, lyrics: str, title: str) -> MusicResult:  # noqa: ARG002
        if not settings.elevenlabs_api_key:
            raise RuntimeError("ELEVENLABS_API_KEY not set")
        with httpx.Client(timeout=180) as client:
            r = client.post(
                "https://api.elevenlabs.io/v1/music",
                headers={
                    "xi-api-key": settings.elevenlabs_api_key,
                    "Content-Type": "application/json",
                },
                json={"prompt": prompt, "music_length_ms": 30000},
            )
            r.raise_for_status()
            return MusicResult(audio_bytes=r.content, mime="audio/mpeg", ext="mp3")
