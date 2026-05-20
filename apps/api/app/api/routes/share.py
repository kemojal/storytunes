"""Public private-share page data (PDD §27). No auth — secret token only."""

from fastapi import APIRouter, HTTPException

from app.api.deps import Db
from app.models.business import Lyrics, Order, SongFile
from app.schemas.production import ShareFile, SharePageOut
from app.services.storage import public_url

router = APIRouter(prefix="/share", tags=["share"])


@router.get("/{token}", response_model=SharePageOut)
def share_page(token: str, db: Db) -> SharePageOut:
    order = db.query(Order).filter(Order.share_token == token).first()
    if order is None or order.status not in ("delivered", "completed"):
        raise HTTPException(404, "Not found")

    latest_lyrics = (
        db.query(Lyrics).filter(Lyrics.order_id == order.id).order_by(Lyrics.version.desc()).first()
    )
    files = (
        db.query(SongFile).filter(SongFile.order_id == order.id, SongFile.is_final.is_(True)).all()
    )

    return SharePageOut(
        order_number=order.order_number,
        recipient_name=order.recipient_name,
        occasion=order.occasion,
        title=latest_lyrics.title if latest_lyrics else None,
        lyrics_text=latest_lyrics.lyrics_text if latest_lyrics else None,
        files=[
            ShareFile(
                file_type=f.file_type,
                file_name=f.file_name,
                url=public_url(f.storage_key),
            )
            for f in files
        ],
    )
