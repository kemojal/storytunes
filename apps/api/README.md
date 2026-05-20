# @storytunes/api

FastAPI business API. Owns the business tables in the shared Neon DB; auth and
payments live in `apps/web` (better-auth). See `../../docs/ARCHITECTURE.md`.

## Layout

```
app/
├── main.py            FastAPI app + router wiring
├── core/
│   ├── config.py      pydantic-settings (.env)
│   └── security.py    validate better-auth session token via shared `session` table
├── db/
│   ├── session.py     SQLAlchemy engine/session (psycopg3, Neon)
│   ├── base.py        DeclarativeBase + AUTH_OWNED_TABLES
│   └── migrate_filter.py  alembic include_object (skip auth tables)
├── models/
│   ├── auth.py        read-only User/Session (owned by web)
│   └── business.py    orders, artists, lyrics, … (owned here)
├── schemas/           pydantic request/response
├── api/
│   ├── deps.py        get_current_user / require_admin / verify_internal_key
│   └── routes/        health, artists, orders, admin, internal (stripe forward)
├── services/          pricing, ai (stubs), email (resend), storage (R2)
└── workers/           celery_app + tasks (production pipeline)
migrations/            alembic
```

## Dev

```bash
uv sync
cp .env.example .env            # set DATABASE_URL (same Neon DB as web), REDIS_URL, INTERNAL_API_KEY
uv run alembic revision --autogenerate -m "init business tables"   # first time
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000   # or: pnpm api:dev
uv run celery -A app.workers.celery_app.celery worker --loglevel=info  # or: pnpm api:worker
```

Swagger: <http://localhost:8000/docs>.

> Run **web** drizzle migrations before the first api migration so the `user`
> table exists (orders FK into it).
