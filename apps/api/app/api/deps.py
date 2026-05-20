from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session as DbSession

from app.core.config import settings
from app.core.security import get_user_by_session_token
from app.db.session import get_session
from app.models.auth import User

Db = Annotated[DbSession, Depends(get_session)]


def get_current_user(
    db: Db,
    authorization: Annotated[str | None, Header()] = None,
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    token = authorization.split(" ", 1)[1]
    user = get_user_by_session_token(db, token)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired session")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_admin(user: CurrentUser) -> User:
    # PDD §13 admin roles. 'customer' is the only non-privileged role.
    if user.role == "customer":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin access required")
    return user


AdminUser = Annotated[User, Depends(require_admin)]


def verify_internal_key(
    x_internal_key: Annotated[str | None, Header()] = None,
) -> None:
    """Guard for service-to-service routes called by web."""
    if not x_internal_key or x_internal_key != settings.internal_api_key:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Bad internal key")
