# Phahendra Babu Library — Free-Tier Deployment Guide

Live site: **https://phagendrababulibrary.in**
Backend API (free): `https://<your-username>.pythonanywhere.com/api/v1`

This guide deploys the app on a **zero-budget** stack:

| Piece | Where it runs | Why |
|---|---|---|
| Frontend (Next.js) | **Hostinger** shared hosting, static files in `public_html` | Hostinger can't run Node.js on a free plan, so we build the Next app as a **static site** (`out/`) and upload it. The app is fully client-rendered (JWT in localStorage), so this works perfectly. |
| Backend (Django API) | **PythonAnywhere** free tier, SQLite database | Free Django hosting with a persistent database. |
| Domain | **Hostinger** DNS → frontend; API lives on `*.pythonanywhere.com` (free tier can't host a custom domain) | |

---

## 1. Backend → PythonAnywhere (free)

### 1.1 Create the account
1. Sign up at <https://www.pythonanywhere.com/registration/register/beginner/> (free, no card).
2. Note your **username** — the API URL becomes `https://<username>.pythonanywhere.com`.

### 1.2 Upload the code
Either clone from GitHub, or upload a zip:

- **Via GitHub:** in the PythonAnywhere Bash console run:
  ```bash
  cd ~
  git clone https://github.com/<you>/<repo>.git phagendra
  ```
- **Via upload:** create a zip of the **`backend/`** folder on your PC, upload it through the **Files** tab, then in Bash:
  ```bash
  cd ~
  unzip backend.zip -d phagendra
  ```

### 1.3 Install dependencies + migrate
```bash
cd ~/phagendra
python -m venv --without-pip venv
pip install --user virtualenv
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.pythonanywhere .env
nano .env        # set DJANGO_SECRET_KEY + your username in ALLOWED_HOSTS
python manage.py migrate
python manage.py createsuperuser    # admin login for /admin
python manage.py collectstatic --noinput
```

> On free tier, `celery`/`redis`/`psycopg` are unused (SQLite + local-memory
> cache are used automatically). You can comment them out of `requirements.txt`
> to make install faster, but they're harmless if left.

### 1.4 Configure the web app
1. **Web** tab → **Add a new web app** → Manual configuration → Python 3.12.
2. In **Virtualenv**, enter `/home/<username>/phagendra/venv`.
3. Set **Working directory** to `/home/<username>/phagendra`.
4. In **WSGI configuration file**, replace the whole file with the contents of
   `~/phagendra/wsgi_pythonanywhere.py` (set `<username>` inside).
5. **Static files:**
   - URL: `/static/` → Directory: `/home/<username>/phagendra/staticfiles/`
   - URL: `/media/` → Directory: `/home/<username>/phagendra/media/`
6. Click **Reload**. Test: `https://<username>.pythonanywhere.com/api/shifts/`

### 1.5 Free-tier limitations we've already handled
- **No cron / Celery beat** → expired memberships and stale seat holds are now
  released **lazily** the next time someone fetches the seat map
  (`apps/core/maintenance.py`, runs max once per minute). This preserves the
  P0 seat-release fix without a scheduler.
- **SMTP restricted to Gmail** → free accounts can only reach
  `smtp.gmail.com`. Set `EMAIL_HOST_USER` + a Gmail **App Password** in
  `.env` (see `backend/.env.pythonanywhere`) and OTP/registration emails are
  delivered for free. If `EMAIL_HOST_USER` is empty, emails fall back to the
  server **console log** (visible under **Web → Error log**).
- **No custom domain** → the API stays on `*.pythonanywhere.com`; the
  frontend calls it via CORS (already whitelisted for your domain).

---

## 2. Frontend → Hostinger (static)

### 2.1 Build the static site
On your PC, from `frontend/`:
```powershell
Copy-Item .env.production.example .env.production
# edit .env.production → NEXT_PUBLIC_API_URL=https://<username>.pythonanywhere.com/api/v1
npm install
npm run build:static        # writes the site to out/
```

### 2.2 Upload to Hostinger
1. hPanel → **Websites** → your plan → **File Manager** (or connect via FTP
   to `ftp://ftp.yourdomain.in`).
2. Go to `public_html` and **delete the default `index.html`**.
3. Upload the **contents of `out/`** into `public_html/` (the `index.html`
   must sit directly in `public_html`, not in a subfolder).
4. Optional: force HTTPS — hPanel → **SSL** → free Let's Encrypt → Force HTTPS.

---

## 3. DNS / domain

Your domain `phagendrababulibrary.in` is currently parked (default
nameservers). Point it at your Hostinger hosting:

1. Wherever the domain is registered (if at Hostinger: **Domains → your
   domain → DNS / Nameservers**), set the nameservers to Hostinger's:
   - `ns1.dns-parking.com`
   - `ns2.dns-parking.com`
2. Or, if using Hostinger's default hosting nameservers from your hPanel plan,
   add a DNS **A record**: `@` → the server IP shown in your hPanel, plus a
   **CNAME** `www` → `@`.
3. Wait 15 min–24 h for propagation. The frontend is now at
   `https://phagendrababulibrary.in`.

The API is **not** on the main domain — it lives at
`https://<username>.pythonanywhere.com` (free-tier constraint).

---

## 4. Environment checklist

| Variable | Where | Value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `frontend/.env.production` (before build) | `https://<username>.pythonanywhere.com/api/v1` |
| `DJANGO_SECRET_KEY` | backend `.env` | long random string |
| `DJANGO_DEBUG` | backend `.env` | `False` |
| `DJANGO_ALLOWED_HOSTS` | backend `.env` | `<username>.pythonanywhere.com` |
| `DJANGO_CORS_ORIGINS` | backend `.env` | `https://phagendrababulibrary.in` |
| `FRONTEND_URL` | backend `.env` | `https://phagendrababulibrary.in` |
| `DJANGO_TRUST_XFF` | backend `.env` | `True` (PythonAnywhere is a trusted proxy) |
| `EMAIL_HOST_USER` | backend `.env` | your Gmail + **App Password** in `EMAIL_HOST_PASSWORD` (free tier allows smtp.gmail.com) |
| `RAZORPAY_KEY_ID/SECRET` | backend `.env` | leave empty on free tier |

---

## 5. Verification

1. `https://<username>.pythonanywhere.com/api/shifts/` → JSON list.
2. Register a member → check **PythonAnywhere Error log** for the OTP → verify
   email → log in on the live frontend.
3. Admin: `https://<username>.pythonanywhere.com/admin` → set up shifts/sections/seats.
4. Open `https://phagendrababulibrary.in` → seat map should load.

---

## 6. Known trade-offs on the free stack

- **Emails are delivered via Gmail SMTP** (free tier allows `smtp.gmail.com`).
  You need 2-Step Verification + an **App Password** for the Gmail account; a
  normal Gmail password fails with `535 SMTPAuthenticationError`.
- **Online payment (Razorpay)** disabled — keep mock payments OFF in
  production; use the admin **cash-approval** flow.
- **API is on a `*.pythonanywhere.com` subdomain**, not your branded domain.
- Seat/membership expiry happens on next page view (≤1 min lag) instead of a
  background job — functionally identical for users.
- Free PythonAnywhere spins the site down after idle; the first request after
  a gap can take a few seconds to wake up.

## 7. Files added/changed for deployment

- `frontend/next.config.ts` — static export (`output: "export"`, `images.unoptimized`)
- `frontend/package.json` — `build:static` script
- `frontend/.env.production.example` — production API URL template
- `backend/apps/core/maintenance.py` — **new** lazy expiry (no-cron fallback)
- `backend/apps/library/views.py` — runs lazy maintenance on seat-map requests
- `backend/wsgi_pythonanywhere.py` — **new** PythonAnywhere WSGI entry point
- `backend/.env.pythonanywhere` — **new** production env template
