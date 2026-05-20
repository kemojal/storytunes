from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""


# Tables NOT owned by the api (created/migrated by better-auth + drizzle in web).
# Alembic autogenerate must ignore these — see app/db/migrate_filter.py.
AUTH_OWNED_TABLES = {
    "user",
    "session",
    "account",
    "verification",
    "subscription",
}
