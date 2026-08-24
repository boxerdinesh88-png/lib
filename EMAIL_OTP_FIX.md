# Email OTP Fix - Phahendra Babu Library

## Problem Identified
Email OTPs were not being sent because the Django email backend was set to `console.EmailBackend` instead of `smtp.EmailBackend`.

## Root Cause
In `backend/.env`, the email configuration was missing the SMTP settings:
- `EMAIL_BACKEND` was not set (defaulted to console backend)
- Email settings were only in the project root `.env` file
- Django loads environment variables from `backend/.env` first

## Solution Applied

### 1. Updated Backend Environment File
**File:** `backend/.env`

Added complete email configuration:
```bash
# Email configuration for local development
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=phagendrababulibrary@gmail.com
EMAIL_HOST_PASSWORD=<your_gmail_app_password>
DEFAULT_FROM_EMAIL=Phahendra Babu Library <phagendrababulibrary@gmail.com>
```

### 2. Updated PythonAnywhere Environment File
**File:** `backend/.env.pythonanywhere`

Added complete email configuration for production:
```bash
# Email via Gmail SMTP for production
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=phagendrababulibrary@gmail.com
EMAIL_HOST_PASSWORD=<your_gmail_app_password>
DEFAULT_FROM_EMAIL=Phahendra Babu Library <phagendrababulibrary@gmail.com>
```

### 2. Testing Results
✅ **Email configuration test:** PASSED
✅ **OTP generation test:** PASSED  
✅ **OTP email sending test:** PASSED

## Verification Steps

### Step 1: Check Email Configuration
Run the email configuration test:
```bash
cd backend
python test_email.py
```

Expected output:
```
EMAIL_BACKEND: django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST: smtp.gmail.com
EMAIL_PORT: 587
EMAIL_HOST_USER: phagendrababulibrary@gmail.com
EMAIL_USE_TLS: True
EMAIL_HOST_PASSWORD: ***
SUCCESS: Email sent successfully! (1 message(s))
```

### Step 2: Test OTP Email
Run the OTP email test:
```bash
cd backend
python test_otp.py
```

Expected output:
```
==================================================
OTP EMAIL TEST
==================================================
Found user: Aarav Sharma (demo@student.edu)

Generating OTP...
OTP Code: [6-digit code]

Sending OTP email...
SUCCESS: OTP email sent successfully!

==================================================
OTP SENT SUCCESSFULLY!
==================================================
Please check your email: demo@student.edu
Expected OTP code: [6-digit code]
```

### Step 3: Test Registration Flow
1. Start the Django development server:
```bash
cd backend
python manage.py runserver
```

2. Start the Next.js development server:
```bash
cd frontend
npm run dev
```

3. Register a new user and verify OTP email is received

## Gmail SMTP Requirements

### Prerequisites
1. **2-Step Verification:** Must be enabled on Gmail account
2. **App Password:** Must be created at https://myaccount.google.com/apppasswords
3. **Correct Credentials:** 16-character app password (not regular password)

### Current Configuration
- **Email:** phagendrababulibrary@gmail.com
- **App Password:** <your_gmail_app_password> (16 characters ✓)
- **Port:** 587 (TLS)
- **Backend:** SMTP

## Troubleshooting

### If Email Still Not Working

1. **Check App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Create a new app password
   - Update `EMAIL_HOST_PASSWORD` in both `.env` files

2. **Check Gmail Security:**
   - Ensure 2-Step Verification is enabled
   - Check for "Less secure app access" (may need to enable temporarily)
   - Check Gmail inbox for security alerts

3. **Check Firewall/Network:**
   - Ensure port 587 is not blocked
   - Check internet connectivity
   - Try with different network

4. **Check Django Logs:**
   - Run server with verbose logging
   - Check for SMTP authentication errors
   - Review console output for detailed error messages

### Common Error Messages

**"Authentication failed"**
- Invalid email or app password
- App password not created correctly
- 2-Step Verification not enabled

**"Connection timeout"**
- Network connectivity issue
- Port 587 blocked by firewall
- SMTP server unreachable

**"TLS/SSL error"**
- `EMAIL_USE_TLS` should be `True`
- Port should be 587 (TLS) or 465 (SSL)

## Production Deployment

### PythonAnywhere Configuration
Update `backend/.env.pythonanywhere`:

```bash
# Email configuration for production
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=phagendrababulibrary@gmail.com
EMAIL_HOST_PASSWORD=<your_gmail_app_password>
DEFAULT_FROM_EMAIL=Phahendra Babu Library <phagendrababulibrary@gmail.com>
```

### Security Notes
- ⚠️ **Never commit `.env` files to Git**
- ⚠️ **Use App Passwords, not regular passwords**
- ⚠️ **Monitor email sending limits** (Gmail: 500/day for free accounts)
- ⚠️ **Consider professional email service** for production (SendGrid, Mailgun, etc.)

## Monitoring Email Delivery

### Check Email Logs
After registration, check Django console for:
```
OTP email to user@example.com sent successfully
```

### Database Verification
Check OTP codes in database:
```bash
cd backend
python manage.py shell
>>> from apps.accounts.models import OTPCode
>>> OTPCode.objects.all()
```

## Additional Files Created

### Test Scripts
- `backend/test_email.py` - Test basic email configuration
- `backend/test_otp.py` - Test OTP generation and email sending
- `backend/test_users.py` - List all users in database

### Usage
```bash
# Test email configuration
python test_email.py

# Test OTP email
python test_otp.py

# List users
python test_users.py
```

## Summary

✅ **Email configuration fixed** - SMTP backend now properly configured in both local and production
✅ **OTP emails working** - Test emails sent successfully
✅ **Gmail SMTP working** - App password authentication successful
✅ **Local development ready** - `backend/.env` updated with SMTP settings
✅ **Production ready** - `backend/.env.pythonanywhere` updated with SMTP settings
✅ **Ready for testing** - Registration flow should now send OTP emails

## Next Steps

1. **Test registration flow** end-to-end
2. **Verify email delivery** in Gmail inbox
3. **Test OTP verification** in registration form
4. **Deploy to production** with updated `.env.pythonanywhere`
5. **Monitor email delivery** after deployment

---

**Status:** ✅ EMAIL OTP ISSUE RESOLVED
**Date:** 2026-08-14
**Test Results:** All email tests passing