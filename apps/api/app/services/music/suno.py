"""Suno provider (via a third-party gateway).

Suno has no official API; this targets the common sunoapi.org-style gateway
shape (generate -> poll). Adjust paths to match your chosen gateway.
"""

import time

import httpx

from app.core.config import settings
from app.services.music import MusicProvider, MusicResult


class SunoProvider(MusicProvider):
    name = "suno"

    def generate(self, prompt: str, *, lyrics: str, title: str) -> MusicResult:
        if not settings.suno_api_key:
            raise RuntimeError("SUNO_API_KEY not set")
        base = settings.suno_api_base.rstrip("/")
        headers = {
            "Authorization": f"Bearer {settings.suno_api_key}",
            "Content-Type": "application/json",
        }
        with httpx.Client(timeout=180) as client:
            create = client.post(
                f"{base}/api/v1/generate",
                headers=headers,
                json={
                    "prompt": lyrics or prompt,
                    "title": title,
                    "tags": prompt,
                    "customMode": bool(lyrics),
                    "instrumental": False,
                },
            )
            create.raise_for_status()
            task_id = create.json().get("data", {}).get("taskId") or create.json().get("id")

            audio_url = None
            for _ in range(90):
                time.sleep(3)
                r = client.get(
                    f"{base}/api/v1/generate/record-info",
                    headers=headers,
                    params={"taskId": task_id},
                ).json()
                items = (r.get("data") or {}).get("response", {}).get("sunoData") or []
                if items and items[0].get("audioUrl"):
                    audio_url = items[0]["audioUrl"]
                    break

            if not audio_url:
                raise RuntimeError("suno generation timed out")
            return MusicResult(remote_url=audio_url, mime="audio/mpeg", ext="mp3")
