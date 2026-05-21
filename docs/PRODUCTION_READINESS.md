# StoryTunes — Production Readiness Checklist

Status of what's done vs. what's needed to take real, paid orders. Items map to
real gaps in this codebase. Ordered most-blocking first.

Legend: `[ ]` todo · `[~]` partial/scaffolded · `[x]` done

---

## 🔴 Must-have before taking real orders

- [ ] **Rotate every exposed secret** — Gemini, Stripe live key, Resend, Neon
      password, Replicate, ElevenLabs (all appeared in chat/local). Move to host
      env vars or a secrets manager. Never commit (`.env*` is gitignored ✓).
- [ ] **Stripe live**: set real `sk_live` (`STRIPE_MODE=live`), register the
      webhook endpoint `/api/auth/stripe/webhook` in the Stripe dashboard, set
      `STRIPE_WEBHOOK_SECRET`, and verify the web→api event forward
      (`/api/internal/stripe-events`) works in prod.
  - [x] Idempotency ledger (`processed_stripe_events`).
  - [x] Resume-payment for unpaid orders (dashboard "Complete payment").
- [ ] **Real Celery worker + Redis** in prod (testing used `CELERY_EAGER`; eager
      won't scale). Add task retries + dead-letter/alert on failed jobs (PDD §38).
- [ ] **Resend domain verification** — `onboarding@resend.dev` only delivers to
      your own inbox. Verify a sending domain, configure SPF/DKIM, set a real
      `EMAIL_FROM`.
  - [x] Email send is resilient + logged (`email_logs`, non-fatal).
- [ ] **Funded AI providers**: Gemini billing (free tier = daily request cap),
      and a paid music provider (Lyria / Replicate / ElevenLabs — all currently
      402/429 on free).
  - [x] Pluggable music provider abstraction (`MUSIC_PROVIDER`).
  - [x] Gemini lyric/brief engine with stub fallback.

## 🟠 Safety / correctness (PDD requires)

- [ ] **Content moderation** (PDD §31): screen orders for hate/explicit/
      impersonation/copyright requests before generation. Not built.
- [ ] **Human review gates**: pipeline auto-advances; enforce admin approval of
      lyrics + audio before deliver (statuses + admin actions exist — gate them).
- [ ] **AI resilience**: retry/backoff on 429, prompt-injection guard, per-order
      cost caps.
- [ ] **Upload safety**: size limits + malware scan on admin file uploads (PDD §37).
- [ ] **Share tokens**: add expiry / optional password (PDD §27) — currently
      permanent + public by token.
  - [x] Files private by default; presigned download URLs.

## 🟡 Security & infra

- [ ] Lock CORS to the real web origin; add secure headers; rate-limit OTP/auth.
  - [x] RBAC on admin (401/403 verified); session validated via shared `session` table.
  - [x] Input validation (zod on web, pydantic on api).
- [ ] **Deploy**: web (Vercel / Node host) + api (Fly / Render) + Redis; HTTPS;
      custom domain; R2 public bucket / CDN for media + the email logo.
  - [x] api Dockerfile; `docker-compose` for local Redis.
- [ ] **Database**: Neon **pooled** at runtime, **direct** for migrations; enable
      backups/PITR; run migrations in CI in order (web drizzle → then api alembic).
  - [x] Shared-DB ownership split (auth tables = web/drizzle, business = api/alembic).
- [ ] **Observability**: wire Sentry DSN + PostHog (both scaffolded), uptime
      monitor, error alerting, structured logs.

## 🟢 Polish / trust

- [x] Real **Terms / Privacy / Refund** pages (`/terms`, `/privacy`, `/refund`,
      footer wired); **cookie consent** banner; **GDPR export + delete**
      (`/dashboard/account` → `GET /api/me/export`, `DELETE /api/me`).
  - [x] AI-disclosure copy (PDD §30) on How-it-works.
- [~] **Tests + CI**: CI workflow gates web (tsc + lint) and api (ruff + format +
      pytest). Unit: pricing, delivery-date, moderation. `flow_test.py` end-to-end.
  - [ ] Still todo: integration (webhook/email/upload), Playwright e2e, status-transition tests.
- [~] **Test data**: `scripts/cleanup_test_data.py` purges `flowtest_*` (+ optional
      `demo-customer` via `INCLUDE_DEMO=1`). Real artists/samples seeded with
      playable audio; swap in your own produced songs for launch.
- [x] **404** page (`notFoundComponent`).
  - [~] a11y/`srcset`: lazy-loading + alt on decorative imgs; full a11y audit + multi-size srcset still todo.
  - [x] Favicons, OG/Twitter meta, PWA manifest, warm theme, branded audio player.

---

## Fastest path to a soft launch

1. Rotate all secrets → host env.
2. Stripe live key + registered webhook.
3. Real Celery worker + Redis (no eager).
4. Resend domain verification.
5. Gemini billing + one funded music provider.
6. Content moderation + human-approval gate before delivery.
7. Deploy web + api + Redis (HTTPS, domain, R2/CDN).
8. Terms / Privacy / Refund pages.

## Already in place (foundation)

- Monorepo (pnpm + turbo), TanStack Start web + FastAPI api, shared Neon DB.
- Auth: email OTP + Google (better-auth), session-based RBAC.
- Full order flow: wizard → Stripe checkout → webhook → AI brief/lyrics → music
  → admin production console → delivery → private share page → artist-voiced
  tailored emails.
- Customer dashboard + admin dashboard; pluggable music; R2 storage with
  presigned URLs; warm, polished UI.

## Suggested next implementations (ask to build)

- Content moderation pass on order submit.
- Retry/backoff wrapper for Gemini/music 429s.
- Share-token expiry + optional password.
- Terms / Privacy / Refund routes.
- CI workflow (lint + typecheck + pytest) + a Playwright e2e.
