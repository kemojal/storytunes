"""Google Lyria music provider (uses the Gemini/genai API key).

Lyria returns raw PCM audio; we wrap it in a WAV container. Requires a paid
Gemini tier — free keys return 429 RESOURCE_EXHAUSTED.
"""

import io
import wave

from app.core.config import settings
from app.services.music import MusicProvider, MusicResult

# Lyria emits 48kHz 16-bit stereo PCM.
_SAMPLE_RATE = 48000
_CHANNELS = 2
_SAMPLE_WIDTH = 2


def _pcm_to_wav(pcm: bytes) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(_CHANNELS)
        w.setsampwidth(_SAMPLE_WIDTH)
        w.setframerate(_SAMPLE_RATE)
        w.writeframes(pcm)
    return buf.getvalue()


class LyriaProvider(MusicProvider):
    name = "lyria"

    def generate(self, prompt: str, *, lyrics: str, title: str) -> MusicResult:  # noqa: ARG002
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.gemini_api_key)
        resp = client.models.generate_content(
            model=settings.lyria_model,
            contents=prompt,
            config=types.GenerateContentConfig(response_modalities=["AUDIO"]),
        )
        pcm = bytearray()
        for cand in resp.candidates or []:
            for part in (cand.content.parts if cand.content else []) or []:
                if part.inline_data and part.inline_data.data:
                    pcm.extend(part.inline_data.data)
        if not pcm:
            raise RuntimeError("Lyria returned no audio")
        return MusicResult(audio_bytes=_pcm_to_wav(bytes(pcm)), mime="audio/wav", ext="wav")
