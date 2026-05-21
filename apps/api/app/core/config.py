from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Shared Neon Postgres (same DB as web). Direct (unpooled) URL.
    database_url: str = "postgresql://user:pass@localhost:5432/storytunes"

    redis_url: str = "redis://localhost:6379/0"

    # Must match web's INTERNAL_API_KEY.
    internal_api_key: str = "dev_internal_key_change_me"

    stripe_secret_key: str = ""

    resend_api_key: str = ""
    email_from: str = "StoryTunes <onboarding@resend.dev>"
    # Fallback artist persona for emails when no artist is assigned yet.
    email_artist_name: str = "Maya"

    r2_account_id: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket: str = "storytunes"
    r2_public_base_url: str = ""

    web_origin: str = "http://localhost:3000"
    # Public base URL of this api (for locally-served media links).
    api_base_url: str = "http://localhost:8000"

    # ---- AI: lyrics (Gemini Flash) ----
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # ---- AI: music generation (pluggable) ----
    # one of: ace | stub | lyria | replicate | suno | elevenlabs
    music_provider: str = "ace"
    ace_music_api_key: str = ""
    ace_music_api_base: str = "https://api.acemusic.ai"
    ace_music_model: str = "acemusic/acestep-v1.5-turbo"
    lyria_model: str = "models/lyria-3-pro-preview"  # Google Lyria (uses GEMINI_API_KEY)
    replicate_api_token: str = ""
    replicate_music_model: str = "meta/musicgen"
    suno_api_key: str = ""
    suno_api_base: str = "https://api.sunoapi.org"
    elevenlabs_api_key: str = ""

    # Run Celery tasks inline (no broker) — used for local flow testing.
    celery_eager: bool = False

    # Automation: screen orders/lyrics + auto-deliver clean songs (no manual
    # admin step on the happy path). Flagged items route to admin review.
    moderation_enabled: bool = True
    auto_deliver: bool = True

    @property
    def has_gemini(self) -> bool:
        return bool(self.gemini_api_key)

    @property
    def sqlalchemy_url(self) -> str:
        """Use the psycopg (v3) driver regardless of how the URL is written."""
        url = self.database_url
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
