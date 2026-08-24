# Phahendra Babu Library — Production Hardening Report

Date: 2026-08-11

## 1. Executive summary

A full-stack audit and hardening pass was performed on the library seat-booking
platform (Django 5 / DRF API + Next.js 15 App Router frontend). All primary
user flows were confirmed working end-to-end, one **critical data-integrity
bug** and several **security issues** were found and fixed, and the app was
re-verified with an automated smoke test, Django system checks, TypeScript
typechecking and a clean production build.

**Key result:** the platform now releases seat reservations when memberships
end, blocks open-redirect and arbitrary-file uploads, guards protected pages
against unauthenticated access, hardens IP handling and rate limiting, and is
configured to run with a real secret key in production.

## 2. Stack & architecture

| Layer | Technology |
|---|---|
| Backend API | Django 5.1, Django REST Framework, SimpleJWT (bearer auth) |
| Database | SQLite (dev, in repo) / PostgreSQL (prod, selected via `POSTGRES_HOST`) |
| Cache / queue | Redis when configured, locmem fallback; Celery + Celery beat (django-celery-beat) |
| Frontend | Next.js 15 (App Router), React 19, Tailwind, Zustand, three.js (landing hero + unused 3D map) |
| Emails | Gmail SMTP via `.env` app password (console backend fallback) |
| Payments | Razorpay (remote) with a mock gateway gated by `ALLOW_MOCK_PAYMENTS` (forced off when `DEBUG=False`) |

Backend is organized per domain: `accounts` (auth/OTP/upload), `library`
(shifts/sections/seats), `memberships` (pricing/activation/payments/cash),
`seats` (booking holds/confirms), `notifications` (email + logs), `analytics`
(admin dashboard), `core` (shared exception handler, pagination, permissions,
IP helper).

## 3. Findings and fixes

### 3.1 Critical — confirmed bookings were never released (FIXED)

**Severity: P0 — data integrity / revenue loss.**

When a membership was activated, its seat hold was confirmed
(`confirm_for_membership`), but nothing ever cancelled that confirmed booking
when the membership ended. `expire_overdue_memberships()` did a bulk
`status="expired"` update and `_release_membership_booking()` only touched
`status="held"` bookings. Because `seat_is_available()` treats any `confirmed`
booking as blocking, a seat could stay locked **forever** after a member's pass
expired — even though the seat was physically empty.

Verified by reproduction before the fix ("seat available to OTHER member after
expiry: False") and after the fix ("True").

**Fix** (`backend/apps/memberships/services.py`):
- `_release_membership_booking()` now cancels both `held` and `confirmed`
  bookings for the membership's slot.
- `expire_overdue_memberships()` iterates (instead of bulk-updating) and
  releases the booking for each expired membership.
- `_supersede_prior_memberships()` releases the superseded membership's
  bookings before cancelling it.

**Proof:** 9/9 assertions pass (booking confirmed on activation → seat blocked
while active → booking cancelled after expiry → seat free for others; supersede
path releases the old confirmed booking while the new one stays confirmed).

### 3.2 Security fixes

| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | P1 | Open redirect via the `next` query parameter on `/login` and `/verify-email` (an attacker could post `?next=https://evil.com`). | New `safeNext()` helper (`frontend/src/lib/navigation.ts`) — only internal paths beginning with `/` are accepted; `//`, `\`, `://` rejected; fallback to `/dashboard`. |
| 2 | P1 | Aadhaar card / profile photo uploads accepted **any** file type (extension-only, no content check) → stored-XSS / abuse vector (e.g. an `.html` file served from `/media/`). | Magic-byte sniffing + extension whitelist + 5 MB cap on `aadhar_document` and `photo` in `backend/apps/accounts/serializers.py` (PDF/PNG/JPEG/WebP). Verified: disguised `.html`/`.txt` rejected, valid PNG/PDF accepted. |
| 3 | P1 | No auth guard on `/dashboard`, `/membership`, `/admin` — unauthenticated visitors got empty shells; non-admins could open the admin route. | New `RequireAuth` client guard (`frontend/src/components/auth/require-auth.tsx`) redirects to `/login?next=...` when unauthenticated and redirects non-admins away from `/admin`. Applied in all three page files. |
| 4 | P1 | `core/permissions.py` referenced `user.is_staff_user`, an attribute that does not exist on `User` → any future use would raise `AttributeError`. | Corrected to `is_staff` (the real Django field). |
| 5 | P1 | `X-Forwarded-For` was trusted unconditionally, so clients could spoof the IP recorded in audit logs and used by rate limiting. | New `TRUST_X_FORWARDED_FOR` setting (default **off**; document in `.env.example`). Shared `client_ip()` helper in `backend/apps/core/ip.py` used by audit middleware and auth views. |
| 6 | P1 | **No `DJANGO_SECRET_KEY` in `.env`** — the app ran on the hardcoded dev default. This is a hard blocker: with `DEBUG=False`, `settings.py` deliberately refuses to start. | Generated a 50-char random secret and added it to the gitignored `.env`. |
| 7 | P2 | Login, register, OTP request/verify, forgot/reset password had no endpoint-specific rate limit (only the generic anon 120/min). | `ScopedRateThrottle` added globally; `auth = 10/min` on login/register, `otp = 5/min` on OTP/reset endpoints. Verified: 11th login attempt returns 429. |

### 3.3 Performance

- `seats_availability()` already replaced per-seat loops with two set-based
  queries (~111 → ~5 queries on the seat-map endpoint). **Confirmed OK.**
- Admin dashboard summary is cached (30 s, Redis-backed when configured).
- The 3D `three.js` scene (`SeatMapCanvas`) was exported but never rendered;
  the membership page imported the pure `seatStatusOf()` helper from the 3D
  module, pulling the whole three.js stack into the page graph. Extracted the
  helper + types to `frontend/src/lib/seat-status.ts`; the 3D module now
  re-exports it. `/membership` first-load JS stayed ≈190 kB (three was already
  lazy-split via `next/dynamic` on the landing hero).
- Confirmed indexes exist on the hot membership/booking lookup fields
  (`Booking` seat/shift/status + user/status + status/held_until; `Membership`
  status/end_date, member/status, seat/status/start/end).

### 3.4 What was checked and is correct (no change needed)

- `AvailableSeatsView` gender→section mapping matches `User.allowed_sections`.
- Client-supplied `ip_address` on registration is harmless — DRF `save(kwargs)`
  overrides it with the server-detected IP.
- Cash-approval flow (Django admin + API) works; confirmation emails send via
  SMTP; mock payments forced off outside DEBUG.
- JWT refresh/blacklist rotation, CSRF/cookie flags, HSTS/SSL-redirect all
  activate only when `DEBUG=False` (verified via `check --deploy`).

## 4. Verification performed

| Check | Result |
|---|---|
| `backend/smoke_test.py` (register, seats, membership, payment, admin, permissions) | **ALL CHECKS PASSED** (31 assertions) |
| P0 booking-release reproduction script | 9/9 passed (transaction rolled back, no data pollution) |
| Upload validator negative/positive tests | 5/5 passed |
| Auth throttle test (12 rapid logins) | 11th/12th → 429 |
| `python manage.py check` | No issues |
| `python manage.py check --deploy` | Only expected DEBUG-mode warnings (clears in production) |
| `npm run typecheck` | Passed |
| `npm run build` (clean `.next`) | Compiled + 12/12 static pages generated |

## 5. Production deployment checklist

Before going live:

1. **Set a strong `DJANGO_SECRET_KEY`** in `.env` (done locally — generate a
   fresh one on the production host and never commit it).
2. `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS` set to your real domains.
3. Run **PostgreSQL** (`POSTGRES_HOST`, `POSTGRES_DB/USER/PASSWORD`) and
   **Redis** (`REDIS_URL`) — Celery beat jobs (`expire_overdue_memberships`,
   `expire_cash_requests`, `expire_stale_holds`, `run_reminder_cycle`) must run
   or expired memberships won't release seats.
4. Set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`; keep
   `ALLOW_MOCK_PAYMENTS=False` (enforced automatically when not DEBUG).
5. Behind a reverse proxy: `DJANGO_TRUST_XFF=True` only if you control the
   proxy; serve `/media/` from nginx (Django only serves media in DEBUG).
6. Install `eslint` + `eslint-config-next` (dev) to silence the build-time
   "ESLint must be installed" warning (pinned to the Next.js version).
7. Run `python manage.py migrate`, `collectstatic`, then
   `gunicorn config.wsgi` (workers ≥ 2; keep 1 if relying on the in-memory
   rate limiter) and `celery -A config worker -B`.

## 6. Known trade-offs / recommended follow-ups (not blocking)

- **JWT stored in `localStorage`** (standard for this SPA, but XSS-stealable).
  Low-risk here because no third-party scripts are loaded and all HTML is
  server-rendered/escaped; an httpOnly-cookie + CSRF architecture would be the
  strictest alternative.
- **`RateLimitMiddleware` is in-memory** — single-process only. Keep one
  gunicorn worker (or move to Redis) in production.
- **`analytics/views.py` `members` endpoint is unpaginated** — fine at library
  scale; paginate if the member list grows large.
- **Media files** contain PII (Aadhaar). Protect `/media/` at the web-server
  layer (basic auth or auth middleware) if uploads should not be public.
- Clean up repo cruft: `backend/db.sqlite3.bak`, `pip-install*.log`,
  `npm-install*.log`, empty `docker/` and `scripts/` directories.
- The pending-cash → new-draft flow silently cancels a member's old pending
  cash request when they start a new purchase; confirm this is desired business
  behaviour.

## 7. Demo access (dev only)

- Member: `demo@student.edu` / `Demo@123`
- Admin: `admin@library.app` / `Admin@123`

## 8. Files changed

Backend:
- `backend/apps/memberships/services.py` — release confirmed bookings on expiry/cancel/supersede
- `backend/apps/accounts/serializers.py` — upload validation (magic bytes, extensions, size)
- `backend/apps/accounts/views.py` — scoped throttles; shared IP helper
- `backend/apps/accounts/middleware.py` — shared IP helper
- `backend/apps/core/ip.py` — new trusted `client_ip()` helper
- `backend/apps/core/permissions.py` — `is_staff_user` → `is_staff`
- `backend/config/settings.py` — `TRUST_X_FORWARDED_FOR`, scoped throttle rates
- `backend/smoke_test.py` — upload a real Aadhaar PNG in the register step

Frontend:
- `frontend/src/lib/navigation.ts` — new `safeNext()` redirect sanitizer
- `frontend/src/components/auth/require-auth.tsx` — new auth/role route guard
- `frontend/src/app/(auth)/login/page.tsx`, `frontend/src/app/(auth)/verify-email/page.tsx` — safe redirects
- `frontend/src/app/(app)/{dashboard,membership,admin}/page.tsx` — wrapped in `RequireAuth`
- `frontend/src/lib/seat-status.ts` — extracted `seatStatusOf`/types out of the three.js module
- `frontend/src/components/three/seat-map-scene.tsx`, `frontend/src/components/membership/membership-app.tsx` — use the light module

Config:
- `.env` — generated strong `DJANGO_SECRET_KEY`
- `.env.example` — document `DJANGO_TRUST_XFF`
