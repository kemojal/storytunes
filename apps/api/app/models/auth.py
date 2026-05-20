"""Read-only mappings to better-auth tables (owned/migrated by web).

These let the api join to / load the current user, but they are listed in
AUTH_OWNED_TABLES so Alembic never tries to manage them. Treat as read-only.
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class User(Base):
    __tablename__ = "user"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True)
    email_verified: Mapped[bool] = mapped_column("email_verified", Boolean, default=False)
    image: Mapped[str | None] = mapped_column(String, nullable=True)
    role: Mapped[str] = mapped_column(String, default="customer")
    stripe_customer_id: Mapped[str | None] = mapped_column(
        "stripe_customer_id", String, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column("created_at", DateTime)
    updated_at: Mapped[datetime] = mapped_column("updated_at", DateTime)


class Session(Base):
    __tablename__ = "session"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    token: Mapped[str] = mapped_column(String, unique=True)
    expires_at: Mapped[datetime] = mapped_column("expires_at", DateTime)
    user_id: Mapped[str] = mapped_column("user_id", String)
    created_at: Mapped[datetime] = mapped_column("created_at", DateTime)
    updated_at: Mapped[datetime] = mapped_column("updated_at", DateTime)
