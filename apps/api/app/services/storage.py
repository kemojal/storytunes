"""Cloudflare R2 (S3-compatible) storage (PDD §26).

Files are private by default; downloads use presigned URLs.
Layout: /orders/{order_id}/final/final-song.mp3, etc.
"""

import boto3
from botocore.client import Config

from app.core.config import settings


def _client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.r2_account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def presigned_get_url(key: str, expires_in: int = 3600) -> str:
    return _client().generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.r2_bucket, "Key": key},
        ExpiresIn=expires_in,
    )


def presigned_put_url(key: str, content_type: str, expires_in: int = 3600) -> str:
    return _client().generate_presigned_url(
        "put_object",
        Params={"Bucket": settings.r2_bucket, "Key": key, "ContentType": content_type},
        ExpiresIn=expires_in,
    )
