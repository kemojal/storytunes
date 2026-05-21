from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import (
    account,
    admin,
    artists,
    files,
    health,
    internal,
    orders,
    samples,
    share,
)
from app.core.config import settings
from app.services.storage import MEDIA_DIR

app = FastAPI(title="StoryTunes API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.web_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api"
app.include_router(health.router, prefix=API_PREFIX)
app.include_router(artists.router, prefix=API_PREFIX)
app.include_router(samples.router, prefix=API_PREFIX)
app.include_router(orders.router, prefix=API_PREFIX)
app.include_router(files.router, prefix=API_PREFIX)
app.include_router(share.router, prefix=API_PREFIX)
app.include_router(account.router, prefix=API_PREFIX)
app.include_router(admin.router, prefix=API_PREFIX)
app.include_router(internal.router, prefix=API_PREFIX)

# Locally-stored generated media (used when R2 is not configured).
MEDIA_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(MEDIA_DIR)), name="media")


@app.get("/")
def root() -> dict:
    return {"service": "storytunes-api", "docs": "/docs"}
