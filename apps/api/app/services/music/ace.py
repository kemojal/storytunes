"""AceMusic (ACE-Step) provider — OpenAI-compatible chat/completions.

Synchronous: returns the song inline as a base64 data URI at
choices[0].message.audio[0].audio_url.url. We decode it to bytes.
"""

import base64

import httpx

from app.core.config import settings
from app.services.music import MusicProvider, MusicResult


def _decode_data_uri(uri: str) -> tuple[bytes, str, str]:
    # data:audio/mpeg;base64,XXXX
    header, _, b64 = uri.partition(",")
    mime = "audio/mpeg"
    if header.startswith("data:") and ";" in header:
        mime = header[5:].split(";", 1)[0] or mime
    ext = "wav" if "wav" in mime else "mp3"
    return base64.b64decode(b64), mime, ext


class AceProvider(MusicProvider):
    name = "ace"

    def generate(self, prompt: str, *, lyrics: str, title: str) -> MusicResult:
        if not settings.ace_music_api_key:
            raise RuntimeError("ACE_MUSIC_API_KEY not set")

        content = prompt if not lyrics else f"{prompt}\n\nLyrics:\n{lyrics}"
        with httpx.Client(timeout=300) as client:
            r = client.post(
                f"{settings.ace_music_api_base.rstrip('/')}/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.ace_music_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.ace_music_model,
                    "messages": [{"role": "user", "content": content}],
                },
            )
            r.raise_for_status()
            data = r.json()

        try:
            uri = data["choices"][0]["message"]["audio"][0]["audio_url"]["url"]
        except (KeyError, IndexError, TypeError) as e:
            raise RuntimeError(f"AceMusic returned no audio: {str(data)[:200]}") from e

        audio, mime, ext = _decode_data_uri(uri)
        if not audio:
            raise RuntimeError("AceMusic returned empty audio")
        return MusicResult(audio_bytes=audio, mime=mime, ext=ext)
