from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session as DbSession

from app.models.auth import Session, User


def get_user_by_session_token(db: DbSession, token: str) -> User | None:
    """Validate a better-auth session token against the shared session table.

    This is how the api authenticates requests originating from web without a
    second auth service — web forwards the session token as a Bearer token.
    """
    now = datetime.now(UTC).replace(tzinfo=None)
    row = db.execute(
        select(User)
        .join(Session, Session.user_id == User.id)
        .where(Session.token == token, Session.expires_at > now)
    ).scalar_one_or_none()
    return row
