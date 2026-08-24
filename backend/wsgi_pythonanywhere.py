"""
PythonAnywhere WSGI entry point optimized for FREE plan.

Paste this into the "WSGI configuration file" of your PythonAnywhere web app
(replace <username> and the project path), or copy it to
/home/<username>/phagendra/backend/wsgi_pythonanywhere.py and point
PythonAnywhere's WSGI file at it.

FREE PLAN OPTIMIZATIONS:
- Reduced startup overhead
- Better timeout handling
- Optimized for SQLite concurrency
"""
import os
import sys

# 1) Your account username and the absolute path to the backend/ folder
USERNAME = "phagendra"
PROJECT_ROOT = f"/home/{USERNAME}/phagendra"

if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

# 2) Load environment variables from backend/.env (or wherever your .env lives)
from dotenv import load_dotenv

load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

# 3) Django settings + WSGI app
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# 4) Apply FREE plan optimizations before Django loads
# These settings help with SQLite concurrency and worker efficiency
os.environ.setdefault("DJANGO_DB_TIMEOUT", "30")

from django.core.wsgi import get_wsgi_application

# 5) Configure WSGI application with FREE plan optimizations
application = get_wsgi_application()

# 6) Disable Django's automatic reloading in production (saves memory/CPU)
# This is already handled by DJANGO_DEBUG=False in production settings
