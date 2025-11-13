# SMTP Setup Guide

Complete guide for configuring email delivery in NxLoy Platform.

## Overview

NxLoy uses **Nodemailer** for email delivery with the following features:

- **SMTP-based delivery** (supports any SMTP server)
- **Handlebars templates** for HTML emails
- **Bull queue integration** for async email processing
- **Environment-based configuration** (no hardcoded defaults)

**Email Templates Available:**
- `verification-email.hbs` - Email verification with PIN
- `password-reset.hbs` - Password reset with PIN
- `welcome-email.hbs` - Welcome message after signup

**Email Service:** `apps/backend/src/email/email.service.ts`

---

## Quick Start (MailHog Recommended)

**For local development, we recommend MailHog** - a fake SMTP server with a web UI.

```bash
# Install MailHog (macOS)
brew install mailhog

# Start MailHog
mailhog

# Add to .env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=noreply@nxloy.local
SMTP_FROM_NAME=NxLoy Platform

# View emails at http://localhost:8025
```

---

## Option 1: Local Development SMTP Servers

### MailHog (Recommended)

**Best for:** Local development, testing email templates

**Features:**
- Web UI to view sent emails
- No real emails sent (safe for testing)
- Cross-platform (macOS, Linux, Windows)
- Zero configuration

**Installation:**

```bash
# macOS
brew install mailhog

# Linux (download binary)
wget https://github.com/mailhog/MailHog/releases/download/v1.0.1/MailHog_linux_amd64
chmod +x MailHog_linux_amd64
sudo mv MailHog_linux_amd64 /usr/local/bin/mailhog

# Windows (download .exe from GitHub releases)
# https://github.com/mailhog/MailHog/releases

# Docker
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

**Configuration:**

```bash
# .env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=noreply@nxloy.local
SMTP_FROM_NAME=NxLoy Platform
```

**Usage:**

```bash
# Start MailHog
mailhog

# Backend sends emails to MailHog (port 1025)
pnpm dev:backend

# View emails in web UI
open http://localhost:8025
```

**Pros:**
- Easiest setup
- Beautiful web UI
- No credentials needed
- Safe for testing (no real emails)

**Cons:**
- Emails don't actually send
- Not suitable for integration testing with real email providers

---

### MailCatcher

**Best for:** Local development (alternative to MailHog)

**Installation:**

```bash
# Requires Ruby
gem install mailcatcher

# Start MailCatcher
mailcatcher

# Or with Docker
docker run -d -p 1025:1025 -p 1080:1080 sj26/mailcatcher
```

**Configuration:**

```bash
# .env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=noreply@nxloy.local
SMTP_FROM_NAME=NxLoy Platform
```

**Web UI:** http://localhost:1080

---

### smtp4dev

**Best for:** Windows developers

**Installation:**

```bash
# Windows (download from GitHub)
# https://github.com/rnwood/smtp4dev/releases

# Docker (cross-platform)
docker run -d -p 3000:80 -p 2525:25 rnwood/smtp4dev
```

**Configuration:**

```bash
# .env
SMTP_HOST=localhost
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=noreply@nxloy.local
SMTP_FROM_NAME=NxLoy Platform
```

**Web UI:** http://localhost:3000

---

## Option 2: Gmail (Quick Testing)

**Best for:** Quick testing with real email delivery

**Setup:**

1. **Enable 2-Step Verification** in your Google Account
2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "NxLoy Development"
   - Copy the 16-character password

**Configuration:**

```bash
# .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=NxLoy Platform
```

**Rate Limits:**
- **500 emails/day** for free Gmail accounts
- **2000 emails/day** for Google Workspace accounts

**Pros:**
- Free
- Real email delivery
- Quick setup

**Cons:**
- Rate limits
- Not suitable for production
- Requires Google account
- Less secure (app passwords)

---

## Option 3: SendGrid (Production-Ready)

**Best for:** Production, staging, and CI/CD environments

**Setup:**

1. **Create SendGrid Account:**
   - Sign up at https://sendgrid.com (free tier: 100 emails/day)
   - Verify your email address

2. **Generate API Key:**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name: "NxLoy Production"
   - Permissions: "Full Access" (or "Mail Send" only for security)
   - Copy the API key (you'll only see it once!)

3. **Verify Sender Identity:**
   - Go to Settings → Sender Authentication
   - Choose "Single Sender Verification" (easiest) or "Domain Authentication" (best for production)
   - Follow verification steps

**Configuration:**

```bash
# .env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-sendgrid-api-key-here
SMTP_FROM_EMAIL=verified-sender@yourdomain.com
SMTP_FROM_NAME=NxLoy Platform
```

**Pricing:**
- **Free:** 100 emails/day forever
- **Essentials:** $19.95/month - 50,000 emails/month
- **Pro:** $89.95/month - 100,000 emails/month

**Pros:**
- Generous free tier
- Production-grade reliability
- Email analytics and tracking
- API-based authentication (more secure than passwords)

**Cons:**
- Requires account signup
- Free tier limited to 100 emails/day

---

## Option 4: Other Cloud Providers

### AWS SES (Amazon Simple Email Service)

**Best for:** AWS-based infrastructure, high volume

**Pricing:** $0.10 per 1,000 emails (after free tier)

**Configuration:**

```bash
# .env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
SMTP_FROM_EMAIL=verified-sender@yourdomain.com
SMTP_FROM_NAME=NxLoy Platform
```

**Setup:** https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html

---

### Mailgun

**Best for:** High deliverability, email tracking

**Pricing:** Free 5,000 emails/month for 3 months

**Configuration:**

```bash
# .env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-mailgun-domain.com
SMTP_PASSWORD=your-mailgun-smtp-password
SMTP_FROM_EMAIL=noreply@your-mailgun-domain.com
SMTP_FROM_NAME=NxLoy Platform
```

**Setup:** https://www.mailgun.com/

---

### Postmark

**Best for:** Transactional emails, excellent deliverability

**Pricing:** $15/month - 10,000 emails

**Configuration:**

```bash
# .env
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-postmark-server-token
SMTP_PASSWORD=your-postmark-server-token
SMTP_FROM_EMAIL=verified-sender@yourdomain.com
SMTP_FROM_NAME=NxLoy Platform
```

**Setup:** https://postmarkapp.com/

---

### Mailtrap (Testing)

**Best for:** Staging/testing environments (no real emails sent)

**Pricing:** Free tier: 500 emails/month

**Configuration:**

```bash
# .env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
SMTP_FROM_EMAIL=noreply@nxloy.local
SMTP_FROM_NAME=NxLoy Platform
```

**Setup:** https://mailtrap.io/

---

## Environment Variables Reference

```bash
# SMTP Server Configuration
SMTP_HOST=smtp.example.com          # SMTP server hostname
SMTP_PORT=587                        # 587 (TLS/STARTTLS) or 465 (SSL)
SMTP_SECURE=false                    # true for port 465, false for 587
SMTP_USER=your-smtp-username         # SMTP authentication username
SMTP_PASSWORD=your-smtp-password     # SMTP authentication password

# Email Sender Configuration
SMTP_FROM_EMAIL=noreply@example.com  # Default sender email address
SMTP_FROM_NAME=NxLoy Platform        # Default sender name
```

**Port Guide:**
- **Port 587** (STARTTLS): Most common, use `SMTP_SECURE=false`
- **Port 465** (SSL): Legacy, use `SMTP_SECURE=true`
- **Port 25**: Usually blocked by ISPs, not recommended

**Important:** NxLoy follows CLAUDE.md standards - **NO fallback defaults**. All SMTP environment variables are required. The backend will fail fast on startup if any are missing.

---

## Verification & Testing

### 1. Verify SMTP Connection

```bash
# Start backend
pnpm dev:backend

# Backend logs should show:
# [EmailService] SMTP connection verified
```

If connection fails, check:
- SMTP_HOST is correct
- SMTP_PORT matches SMTP_SECURE setting
- SMTP_USER and SMTP_PASSWORD are valid
- Firewall allows outbound connections

### 2. Test Email Sending

**Via Swagger UI:**

1. Open http://localhost:8080/api/docs
2. Click "Authorize" → Enter JWT token (from `/auth/signup` or `/auth/login`)
3. Test `/verification/request` endpoint:
   ```json
   {
     "email": "test@example.com",
     "type": "EMAIL"
   }
   ```

**Via curl:**

```bash
# 1. Signup to get access token
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User"
  }'

# 2. Check email sent (MailHog UI or your email inbox)
```

### 3. Check Bull Queue

```bash
# Monitor email queue status
pnpm queue:stats

# Or manually via redis-cli
redis-cli KEYS "bull:email:*"
redis-cli LRANGE bull:email:waiting 0 -1
```

---

## Troubleshooting

### Connection Refused

**Symptom:** `ECONNREFUSED` or `Connection timeout`

**Solutions:**
- Check SMTP_HOST and SMTP_PORT are correct
- Ensure SMTP server is running (for local tools like MailHog)
- Check firewall/network allows outbound SMTP connections
- For cloud providers, verify account is active and not suspended

---

### Authentication Failed

**Symptom:** `535 Authentication failed` or `Invalid credentials`

**Solutions:**
- Verify SMTP_USER and SMTP_PASSWORD are correct
- For Gmail: Ensure you're using an App Password, not your account password
- For SendGrid/Mailgun: Ensure API key is valid and has "Mail Send" permissions
- Check if account requires 2FA or additional verification

---

### TLS/SSL Errors

**Symptom:** `CERT_HAS_EXPIRED`, `UNABLE_TO_VERIFY_LEAF_SIGNATURE`

**Solutions:**
- Ensure SMTP_PORT matches SMTP_SECURE setting:
  - Port 587 → `SMTP_SECURE=false`
  - Port 465 → `SMTP_SECURE=true`
- Update Node.js to latest LTS (SSL certificate issues)
- For local development, use MailHog (no TLS required)

---

### Emails Not Arriving

**Symptom:** Email sends successfully but doesn't arrive

**Solutions:**
- Check spam/junk folder
- Verify SMTP_FROM_EMAIL is verified with your email provider
- Check provider's email logs/dashboard for delivery status
- For Gmail: Check "Sent" folder
- Ensure recipient email is valid and accepts emails

---

### Queue Processing Stuck

**Symptom:** Emails stuck in queue, not processing

**Solutions:**
- Check Redis is running: `redis-cli ping` (should return `PONG`)
- Restart backend to reinitialize queue workers
- Check queue stats: `pnpm queue:stats`
- Monitor queue in real-time: `pnpm redis:monitor`

---

## Recommended Setup by Environment

### Development (Local)

```bash
# Use MailHog - easiest, safest
brew install mailhog
mailhog

SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_FROM_EMAIL=dev@nxloy.local
SMTP_FROM_NAME=NxLoy Dev
```

### Staging/CI/CD

```bash
# Use Mailtrap - prevents accidental real emails
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
SMTP_FROM_EMAIL=staging@nxloy.com
SMTP_FROM_NAME=NxLoy Staging
```

### Production

```bash
# Use SendGrid, AWS SES, or Postmark
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.production-api-key
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=NxLoy Platform
```

---

## Next Steps

1. Choose an SMTP provider from options above
2. Configure `.env` with appropriate settings
3. Start backend: `pnpm dev:backend`
4. Test email sending via Swagger UI
5. Monitor queue: `pnpm queue:stats`

**Related Documentation:**
- [Email Service Implementation](../../apps/backend/src/email/email.service.ts)
- [Queue Module](../../apps/backend/src/queue/queue.module.ts)
- [Environment Variables](../../CLAUDE.md#core-standards)
- [Backend Development Guide](../development/backend.md)

---

**Need Help?**
- Check [Troubleshooting](#troubleshooting) section above
- Review backend logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure Redis is running for queue processing
