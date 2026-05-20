"""File upload (admin) + download (owner/admin). R2 presigned URLs (PDD §26)."""

from fastapi import APIRouter, HTTPException

from app.api.deps import AdminUser, CurrentUser, Db
from app.models.business import Order, SongFile
from app.schemas.production import (
    DownloadUrlOut,
    FileOut,
    PresignUploadIn,
    PresignUploadOut,
)
from app.services.storage import presigned_put_url, public_url

router = APIRouter(prefix="/files", tags=["files"])


@router.post(
    "/orders/{order_id}/presign-upload",
    response_model=PresignUploadOut,
)
def presign_upload(
    order_id: str, payload: PresignUploadIn, db: Db, _: AdminUser
) -> PresignUploadOut:
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(404, "Order not found")

    folder = "final" if payload.is_final else "drafts"
    key = f"orders/{order_id}/{folder}/{payload.file_name}"

    # Register the file row up-front; the client PUTs the bytes to upload_url.
    record = SongFile(
        order_id=order_id,
        file_type=payload.file_type,
        file_url=key,
        storage_key=key,
        file_name=payload.file_name,
        mime_type=payload.mime_type,
        is_final=payload.is_final,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return PresignUploadOut(
        upload_url=presigned_put_url(key, payload.mime_type),
        storage_key=key,
        file_id=record.id,
    )


@router.get("/orders/{order_id}", response_model=list[FileOut])
def list_order_files(order_id: str, db: Db, user: CurrentUser) -> list[SongFile]:
    order = db.get(Order, order_id)
    if order is None or (order.user_id != user.id and user.role == "customer"):
        raise HTTPException(404, "Order not found")
    return db.query(SongFile).filter(SongFile.order_id == order_id).all()


@router.get("/{file_id}/download", response_model=DownloadUrlOut)
def download_file(file_id: str, db: Db, user: CurrentUser) -> DownloadUrlOut:
    file = db.get(SongFile, file_id)
    if file is None:
        raise HTTPException(404, "File not found")
    order = db.get(Order, file.order_id)
    # Owner or any admin may download.
    if order is None or (order.user_id != user.id and user.role == "customer"):
        raise HTTPException(404, "File not found")
    return DownloadUrlOut(url=public_url(file.storage_key))
