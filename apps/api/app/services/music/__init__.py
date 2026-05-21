"""Pluggable AI music generation (PDD §16).

Switch provider with MUSIC_PROVIDER=stub|replicate|suno|elevenlabs.
Each provider returns a MusicResult: either a remote URL or raw audio bytes.
`generate_and_store` runs generation and persists the file, returning the
SongFile fields to record.
"""

from dataclasses import dataclass

from app.core.config import settings
from app.services import storage


@dataclass
class MusicResult:
    remote_url: str | None = None
    audio_bytes: bytes | None = None
    mime: str = "audio/mpeg"
    ext: str = "mp3"


class MusicProvider:
    name = "base"

    def generate(self, prompt: str, *, lyrics: str, title: str) -> MusicResult:  # noqa: ARG002
        raise NotImplementedError


def _provider() -> MusicProvider:
    from app.services.music.ace import AceProvider
    from app.services.music.elevenlabs import ElevenLabsProvider
    from app.services.music.lyria import LyriaProvider
    from app.services.music.replicate import ReplicateProvider
    from app.services.music.stub import StubProvider
    from app.services.music.suno import SunoProvider

    return {
        "ace": AceProvider,
        "stub": StubProvider,
        "lyria": LyriaProvider,
        "replicate": ReplicateProvider,
        "suno": SunoProvider,
        "elevenlabs": ElevenLabsProvider,
    }.get(settings.music_provider, StubProvider)()


def generate_and_store(order_id: str, prompt: str, *, lyrics: str, title: str) -> dict:
    """Generate audio and persist it. Returns SongFile column values."""
    provider = _provider()
    result = provider.generate(prompt, lyrics=lyrics, title=title)

    file_name = f"{title or 'song'}.{result.ext}".replace("/", "-")
    size_bytes = None

    if result.remote_url:
        storage_key = result.remote_url
        file_url = result.remote_url
    elif result.audio_bytes:
        key = f"orders/{order_id}/final/{file_name}"
        storage_key = storage.store_bytes(key, result.audio_bytes, result.mime)
        file_url = storage_key
        size_bytes = len(result.audio_bytes)
    else:
        raise RuntimeError(f"music provider '{provider.name}' returned nothing")

    return {
        "file_type": result.ext if result.ext in ("mp3", "wav") else "mp3",
        "file_url": file_url,
        "storage_key": storage_key,
        "file_name": file_name,
        "mime_type": result.mime,
        "size_bytes": size_bytes,
        "is_final": True,
    }
