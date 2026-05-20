# StoryTunes — Architecture

Monorepo: **pnpm workspaces + Turborepo**. Two deployable apps share one Neon Postgres DB.

```
StoryTunes/
├── apps/
│   ├── web/   TanStack Start (TS). Marketing, order wizard, dashboards,
│   │          AUTH (email OTP + Google) and PAYMENTS (Stripe) via better-auth.
│   └── api/   FastAPI (Python). Business logic, production pipeline,
│              Celery jobs, R2 storage, AI songwriting, admin operations.
├── docs/
├── turbo.json
├── pnpm-workspace.yaml
└── docker-compose.yml   (local Redis for Celery)
```

## Why this split

- **Auth + payments live in `web`.** better-auth is a TS library; it owns the
  user session lifecycle and the Stripe customer/subscription flow. Keeping it
  next to the UI removes a network hop for login/checkout and gives end-to-end
  type safety in the front end.
- **Everything else lives in `api`.** Python is where the AI songwriting,
  music-generation orchestration, Celery background jobs, and admin tooling are
  strongest (per PDD §20).

## The shared database (the important part)

Both apps point at the **same Neon Postgres instance** via `DATABASE_URL`.
Ownership is split by table, and **each side migrates only its own tables**:

| Tables                                                      | Owner    | Migrations          |
| ----------------------------------------------------------- | -------- | ------------------- |
| `user`, `session`, `account`, `verification`, `subscription`| **web**  | drizzle-kit         |
| `orders`, `artists`, `lyrics`, `song_files`, …              | **api**  | alembic             |

Rules that keep this from colliding:

1. **web never migrates business tables.** Its drizzle schema (`apps/web/src/db/schema.ts`)
   contains only the better-auth + Stripe tables.
2. **api never migrates auth tables.** Alembic's `env.py` uses an `include_object`
   filter so autogenerate ignores any table it does not own
   (`apps/api/app/db/migrate_filter.py`).
3. **api references auth read-only.** `orders.user_id` is a FK to better-auth's
   `user.id` (a `text` id). The `User`/`Session` ORM classes in
   `apps/api/app/models/auth.py` map existing rows for joins/auth — they are
   excluded from autogenerate so alembic won't try to recreate them.

Run order on a fresh DB: **web migrations first** (creates `user`), then **api
migrations** (business tables FK into `user`).

## Authentication across the boundary

better-auth issues a session cookie/token in `web`. When `web` calls `api`, it
forwards the session token (`Authorization: Bearer <token>`). `api` validates by
looking the token up in the shared `session` table and loading the `user` row —
no second auth service, no shared secret for user auth. See
`apps/api/app/core/security.py`.

Role-based admin access uses a `role` field on the better-auth user (added via
`additionalFields`), checked by `require_admin` dependency in the api.

## Payment flow (Stripe)

```
web: order review
  → better-auth stripe plugin creates Checkout Session
  → user pays on Stripe
  → Stripe → web webhook  POST /api/auth/stripe/webhook   (signature verified by plugin)
  → web plugin onEvent() forwards the verified event to api:
        POST {API_URL}/api/internal/stripe-events   (X-Internal-Key: INTERNAL_API_KEY)
  → api marks order paid + enqueues Celery production job
```

Why forward instead of letting api take the webhook directly? The Stripe
customer + signing secret live with the better-auth plugin in `web`, so `web`
is the single verified entry point. `api` trusts only the internal key, and
order writes stay inside `api` (the table owner). The forward is idempotent:
`api` keys on `stripe_event_id` (see `processed_stripe_events`).

## Background jobs

Celery + Redis (PDD §24). Worker: `pnpm api:worker`. Tasks: brief generation,
lyric generation, music prompt, audio processing, delivery emails. Redis runs
locally via `docker compose up -d`.

## Local dev

```
pnpm install            # JS deps (web + turbo)
(cd apps/api && uv sync) # Python deps
cp .env.example apps/web/.env.local   # fill in
cp .env.example apps/api/.env         # fill in
docker compose up -d                  # redis
pnpm db:migrate                       # web (drizzle) then api (alembic)
pnpm dev                              # web :3000, api :8000, worker
```
