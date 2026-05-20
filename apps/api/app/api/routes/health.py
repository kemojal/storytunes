from fastapi import APIRouter
from sqlalchemy import text

from app.api.deps import Db

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.get("/health/db")
def health_db(db: Db) -> dict:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "db": "reachable"}
