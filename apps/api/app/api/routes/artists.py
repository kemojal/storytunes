from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.api.deps import AdminUser, Db
from app.models.business import Artist
from app.schemas.artist import ArtistCreate, ArtistOut

router = APIRouter(prefix="/artists", tags=["artists"])


@router.get("", response_model=list[ArtistOut])
def list_artists(db: Db) -> list[Artist]:
    return list(db.execute(select(Artist).where(Artist.is_active.is_(True))).scalars())


@router.get("/{slug}", response_model=ArtistOut)
def get_artist(slug: str, db: Db) -> Artist:
    artist = db.execute(select(Artist).where(Artist.slug == slug)).scalar_one_or_none()
    if artist is None:
        raise HTTPException(404, "Artist not found")
    return artist


@router.post("", response_model=ArtistOut, status_code=201)
def create_artist(payload: ArtistCreate, db: Db, _: AdminUser) -> Artist:
    artist = Artist(**payload.model_dump())
    db.add(artist)
    db.commit()
    db.refresh(artist)
    return artist
