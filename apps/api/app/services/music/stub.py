import httpx

from app.services.music import MusicProvider, MusicResult

# A short royalty-free clip used as placeholder audio so the full pipeline
# (incl. R2 storage) is exercisable without a paid music-provider key.
_PLACEHOLDER_MP3 = "https://download.samplelib.com/mp3/sample-9s.mp3"


class StubProvider(MusicProvider):
    name = "stub"

    def generate(self, prompt: str, *, lyrics: str, title: str) -> MusicResult:
        # Return bytes (not a URL) so the result is persisted to R2/local like a
        # real bytes-producing provider would be.
        try:
            data = httpx.get(_PLACEHOLDER_MP3, timeout=60, follow_redirects=True).content
            return MusicResult(audio_bytes=data, mime="audio/mpeg", ext="mp3")
        except Exception:  # noqa: BLE001 - fall back to a plain URL reference
            return MusicResult(remote_url=_PLACEHOLDER_MP3, mime="audio/mpeg", ext="mp3")
