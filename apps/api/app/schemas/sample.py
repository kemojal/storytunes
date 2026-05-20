from pydantic import BaseModel, ConfigDict


class SampleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    occasion: str | None
    mood: str | None
    artist_name: str | None
    audio_url: str
    description: str | None
    is_active: bool


class SampleCreate(BaseModel):
    title: str
    audio_url: str
    occasion: str | None = None
    mood: str | None = None
    artist_name: str | None = None
    description: str | None = None
