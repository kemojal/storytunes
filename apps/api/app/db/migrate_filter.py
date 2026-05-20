from app.db.base import AUTH_OWNED_TABLES


def include_object(obj, name, type_, reflected, compare_to):
    """Alembic hook: skip tables owned by web (better-auth/drizzle).

    Keeps the api's autogenerate from trying to create/drop the auth tables
    that live in the same shared database.
    """
    if type_ == "table" and name in AUTH_OWNED_TABLES:
        return False
    return True
