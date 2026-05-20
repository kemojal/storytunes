"""Replicate MusicGen (Meta) provider.

Uses Replicate's synchronous prediction API. MusicGen is instrumental; the
prompt carries genre/mood/tempo. Returns the hosted output URL.
"""

import time

import httpx

from app.core.config import settings
from app.services.music import MusicProvider, MusicResult

_BASE = "https://api.replicate.com/v1"


class ReplicateProvider(MusicProvider):
    name = "replicate"

    def generate(self, prompt: str, *, lyrics: str, title: str) -> MusicResult:  # noqa: ARG002
        if not settings.replicate_api_token:
            raise RuntimeError("REPLICATE_API_TOKEN not set")
        headers = {
            "Authorization": f"Bearer {settings.replicate_api_token}",
            "Content-Type": "application/json",
        }
        with httpx.Client(timeout=240) as client:
            # Resolve the model's latest version, then create a prediction.
            model = client.get(
                f"{_BASE}/models/{settings.replicate_music_model}", headers=headers
            )
            model.raise_for_status()
            version = model.json()["latest_version"]["id"]
            create = client.post(
                f"{_BASE}/predictions",
                headers=headers,
                json={"version": version, "input": {"prompt": prompt, "duration": 30}},
            )
            create.raise_for_status()
            pred = create.json()

            # Poll until terminal.
            url = pred["urls"]["get"]
            for _ in range(60):
                if pred["status"] in ("succeeded", "failed", "canceled"):
                    break
                time.sleep(2)
                pred = client.get(url, headers=headers).json()

            if pred["status"] != "succeeded":
                raise RuntimeError(f"replicate prediction {pred['status']}")

            out = pred["output"]
            audio_url = out[0] if isinstance(out, list) else out
            return MusicResult(remote_url=audio_url, mime="audio/wav", ext="wav")
