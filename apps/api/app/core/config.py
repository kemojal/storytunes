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

    r2_account_id: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket: str = "storytunes"
    r2_public_base_url: str = ""

    web_origin: str = "http://localhost:3000"

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
