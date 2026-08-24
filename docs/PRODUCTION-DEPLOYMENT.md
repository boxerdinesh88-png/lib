# Phahendra Babu Library — Production Deployment (VPS)

Date: 2026-08-13

**Goal:** serve 30-40+ concurrent users without "server busy" errors.

## 1. Why the free tier can't handle 30-40 users

The current live stack is **PythonAnywhere free tier + SQLite**. Two hard limits
make "server busy" unavoidable once a few dozen people log in at once:

| Cause | What happens |
|---|---|
| PythonAnywhere **free** web apps serve at most ~3 simultaneous requests and have a daily CPU-second quota. When exceeded, the platform itself shows a "busy" page — **no code change fixes this**. |
| **SQLite** locks the whole database file for every write. Under concurrent bookings you get `database is locked` 500s. |
| Emails (OTP, confirmations) were sent **inline** over Gmail SMTP — each one holds a worker for 1-3 s, so 5 users registering at once stalls the queue. |

Professional fix = a real host with **PostgreSQL + Redis + Celery + multi-worker
gunicorn**. Cheap options: Hetzner CX22 (₹~), Hostinger KVM VPS, Railway, or
Render. A 1 vCPU / 2 GB box is comfortably enough for 30-40 users.

The code has already been hardened for this (see §4). Follow the steps below
to actually run it on a VPS.

## 2. Server setup (Ubuntu 24.04, one-time)

```bash
apt update && apt upgrade -y
apt install -y python3.12-venv nginx postgresql redis-server certbot python3-certbot-nginx

# PostgreSQL user + db
sudo -u postgres psql -c "CREATE USER libseat WITH PASSWORD '<strong>';"
sudo -u postgres psql -c "CREATE DATABASE libseat OWNER libseat;"

systemctl enable --now redis-server
```

## 3. Deploy the backend

```bash
mkdir -p /opt/phagendra && cd /opt/phagendra
# upload backend/ (rsync/scp/git clone) into /opt/phagendra/backend

python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt

cp backend/.env.vps.example backend/.env
nano backend/.env          # fill real secrets (see template)

backend/.venv/bin/python backend/manage.py migrate
backend/.venv/bin/python backend/manage.py collectstatic --noinput
backend/.venv/bin/python backend/manage.py createsuperuser
```

## 4. Run the services (systemd)

Copy the units in `deploy/` and enable them:

```bash
cp deploy/gunicorn.service deploy/celery-worker.service deploy/celery-beat.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now gunicorn celery-worker celery-beat
```

If you moved the project somewhere other than `/opt/phagendra`, edit the
`WorkingDirectory=`/`EnvironmentFile=`/`ExecStart=` paths in the three units.

Three processes run for the app to stay healthy under load:

| Service | Purpose |
|---|---|
| `gunicorn` | API server, `2×CPU+1` workers × 2 threads (see `config/gunicorn.conf.py`) |
| `celery-worker` | Background email + maintenance jobs — the API returns instantly instead of waiting on SMTP |
| `celery-beat` | Scheduler: expires stale holds (1 min), expired memberships & cash requests (5 min), reminders (1 h) |

## 5. Reverse proxy + TLS (nginx)

```bash
cp deploy/nginx.conf /etc/nginx/sites-available/phagendra
ln -s /etc/nginx/sites-available/phagendra /etc/nginx/sites-enabled/phagendra
nginx -t && systemctl reload nginx
# HTTPS:
certbot --nginx -d api.phagendrababulibrary.in
```

The nginx config already adds gzip, long static-file caching and proxy
timeouts so slow responses don't hang workers.

## 6. Frontend

Keep the static export on Hostinger (unchanged), just point
`NEXT_PUBLIC_API_URL` at your new API domain and rebuild:

```powershell
# frontend/.env.production
NEXT_PUBLIC_API_URL=https://api.phagendrababulibrary.in/api/v1
npm run build:static
# upload out/ → public_html/
```

## 7. Verify under load

```bash
# watch the API handle parallel requests
ab -n 200 -c 40 https://api.phagendrababulibrary.in/api/shifts/
backend/.venv/bin/python backend/manage.py check
journalctl -u gunicorn -f
```

`ab` at 40 concurrent should show near-zero failures; check gunicorn logs for
`[CRITICAL] WORKER TIMEOUT` (raise `GUNICORN_TIMEOUT`) or SQLite remnants
(you're on PostgreSQL, there shouldn't be any).

## 8. What was changed in code (this pass)

| File | Change |
|---|---|
| `backend/apps/notifications/tasks.py` | **new** — `send_email_task` (Celery, retries) + `dispatch_email()` with sync fallback |
| `backend/apps/accounts/services.py` | OTP emails now go through `dispatch_email` (async in prod) |
| `backend/apps/notifications/channels.py` | confirmation/ack/reminder emails async via the same path |
| `backend/apps/memberships/tasks.py` | + `expire_memberships_task` (overdue memberships) |
| `backend/config/settings.py` | `USE_CELERY` flag + `CELERY_BEAT_SCHEDULE` for all maintenance jobs |
| `backend/config/gunicorn.conf.py` | **new** — multi-worker/thread production gunicorn config |
| `backend/apps/library/views.py` | `/api/shifts/` cached 60 s (cut DB load on every page load) |
| `frontend/src/lib/api.ts` | auto-retry GETs (2×, backoff) on 429/502/503/504/dropped connections — spikes self-heal instead of showing errors |
| `deploy/*` | **new** — systemd units for gunicorn/celery-worker/celery-beat + nginx config |
| `backend/.env.vps.example` | **new** — production env template (Postgres/Redis/SMTP/Razorpay) |

## 9. Operational notes

- **Backups:** `pg_dump libseat > libseat-$(date +%F).sql` daily (cron) + upload
  `/media/` (contains member photos/Aadhaar — keep it private, not on a CDN).
- **Load plan:** at 30-40 users one VPS core is plenty. If it ever grows to
  hundreds, the next lever is a managed Postgres + a CDN in front of the
  static frontend — no code change needed.
- **Secrets:** never commit `backend/.env` or `frontend/.env.production`.
  Rotate `DJANGO_SECRET_KEY` = log everyone out (JWT is signed with it).
