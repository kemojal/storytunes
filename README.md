# StoryTunes

Custom family-song gift platform (PDD: `docs/PDD.md`). Turn a story into a song.

A **pnpm + Turborepo** monorepo with two apps over one shared Neon Postgres DB.

| App        | Stack                                   | Responsibility                                           |
| ---------- | --------------------------------------- | -------------------------------------------------------- |
| `apps/web` | TanStack Start, React 19, Tailwind, shadcn | Marketing site, order wizard, dashboards, **auth** (email OTP + Google) and **payments** (Stripe) via better-auth |
| `apps/api` | FastAPI, SQLAlchemy, Alembic, Celery    | Orders, production pipeline, AI songwriting, R2 storage, admin |

Architecture & the shared-DB ownership model: **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

## Quick start

```bash
# 0. prerequisites: node>=22, pnpm, uv, docker
pnpm install
(cd apps/api && uv sync)

# 1. env — create a Neon DB at https://neon.new, then:
cp .env.example apps/web/.env.local   # fill in DATABASE_URL + auth/stripe/resend
cp .env.example apps/api/.env         # fill in DATABASE_URL + redis/r2

# 2. infra (redis for Celery)
docker compose up -d

# 3. migrate — web first (creates `user`), then api (business tables)
pnpm --filter @storytunes/web db:migrate
(cd apps/api && uv run alembic upgrade head)

# 4. run everything (web :3000, api :8000, celery worker)
pnpm dev
```

## Common commands

| Command              | Does                                            |
| -------------------- | ----------------------------------------------- |
| `pnpm dev`           | run web + api + worker (turbo)                  |
| `pnpm web:dev`       | just the web app                                |
| `pnpm api:dev`       | just the api (uvicorn --reload)                 |
| `pnpm api:worker`    | just the Celery worker                          |
| `pnpm build`         | build all                                       |
| `pnpm lint` / `test` | lint / test all                                 |
| `pnpm db:generate`   | generate drizzle migration from web schema      |
| `pnpm infra:up/down` | start/stop redis                                |

API docs (Swagger) when api is running: <http://localhost:8000/docs>.
