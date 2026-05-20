from pydantic import BaseModel, ConfigDict


class ArtistOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    bio: str | None = None
    image_url: str | None = None
    voice_description: str | None = None
    personality: str | None = None
    best_for: list[str] | None = None
    genres: list[str] | None = None
    sample_audio_url: str | None = None
    is_active: bool


class ArtistCreate(BaseModel):
    name: str
    slug: str
    bio: str | None = None
    image_url: str | None = None
    voice_description: str | None = None
    personality: str | None = None
    best_for: list[str] | None = None
    genres: list[str] | None = None
    sample_audio_url: str | None = None
