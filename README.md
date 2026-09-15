# SoulSync v0.2

SoulSync is a full-stack matrimonial platform built as a production-oriented modular monolith.

## Stack

- Java 21 + Spring Boot 3.5.16
- Spring Security + JWT access/rotating refresh tokens
- PostgreSQL 17 + Flyway
- Spring Data JPA
- STOMP WebSocket messaging
- Next.js 16.3.3 + React 19 + TypeScript
- Docker Compose
- SMTP email delivery with Mailpit for local testing
- Provider-based SMS verification with a Twilio implementation
- Stripe Checkout/webhook integration when credentials are supplied

## Core product features

- Registration, 6-digit email OTP verification, login, refresh, logout
- Forgot/reset password
- Phone verification with 6-digit OTP
- OTP expiry, resend cooldown, max-attempt lockout, hashed OTP storage
- Verified-profile badges
- Detailed matrimonial profile and profile completion
- Multiple profile photos with protected access and visibility metadata
- Partner preferences
- Advanced profile search
- Weighted compatibility recommendations
- Send/accept/decline/withdraw interests
- Shortlist
- Profile views / who viewed me
- Block/report safety controls
- Connection-only conversations
- Persisted chat + read status + authenticated STOMP user queues
- Notification center
- Free/Premium/Premium Plus entitlements
- Stripe Checkout + signed webhook handling
- Development-only subscription switch
- Admin account list, suspension/reactivation, report moderation
- Health/readiness endpoints and Dockerized local stack
- Integration tests + GitHub Actions CI + Docker smoke verification

## Identity verification behavior

SoulSync v0.2 uses two verification levels:

1. **Email verified** — required before the user can sign in.
2. **Phone verified** — required before the user can send/accept interests or use chat.

OTP security defaults:

- 6 digits
- 10-minute expiry
- 60-second resend cooldown
- 5 incorrect attempts maximum
- OTP values are stored using the application's password encoder rather than in plaintext

All values are configurable through environment variables.

## Quick start

### Prerequisite

Install Docker Desktop and make sure Docker is running.

### 1. Configure local development

```bash
cp .env.example .env
```

The provided defaults are for local development only.

### 2. Start everything

```bash
docker compose up --build -d
```

Check containers:

```bash
docker compose ps
```

Open:

- SoulSync: http://localhost:3000
- API health: http://localhost:8080/actuator/health
- Mailpit: http://localhost:8025

### 3. Run the end-to-end smoke test

```bash
./scripts/verify.sh
```

The v0.2 smoke test verifies:

- backend health
- frontend reachability
- registration
- email OTP verification
- login
- phone OTP verification
- identity verification status
- profile persistence
- partner preferences
- recommendations/search
- notifications

## Demo accounts

With `SEED_DEMO=true`, demo users are already email + phone verified so matching/chat can be tested immediately:

- `ananya@soulsync.dev` / `Password123!`
- `arjun@soulsync.dev` / `Password123!`
- `meera@soulsync.dev` / `Password123!`
- `kavya@soulsync.dev` / `Password123!`
- `rahul@soulsync.dev` / `Password123!`
- `sneha@soulsync.dev` / `Password123!`
- Admin: `admin@soulsync.dev` / `Admin123!`

## Test a new user's verification flow locally

By default:

```env
DEV_MODE=true
MAIL_ENABLED=false
SMS_PROVIDER=dev
```

In this mode SoulSync does not send external email/SMS. Instead, the API returns development OTP values and the frontend fills them into the verification forms automatically.

Flow:

1. Register a new account.
2. Verify the 6-digit email code.
3. Sign in.
4. Open **Settings**.
5. Enter a phone number in E.164 format, for example `+14695551234`.
6. Click **Send verification code**.
7. In development mode the 6-digit phone code is filled automatically.
8. Verify the phone.
9. Interests and chat are now enabled.

## Test actual local email with Mailpit

Set:

```env
MAIL_ENABLED=true
```

Restart the backend:

```bash
docker compose up --build -d backend
```

Register a new account and open http://localhost:8025 to read the verification email.

## Real SMTP email

SoulSync uses Spring's `JavaMailSender`. Configure a real SMTP provider with:

```env
MAIL_ENABLED=true
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your-user
MAIL_PASSWORD=your-password
MAIL_SMTP_AUTH=true
MAIL_STARTTLS=true
MAIL_FROM=no-reply@yourdomain.com
```

## Real SMS with Twilio

Set:

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM_NUMBER=+15551234567
```

When `SMS_PROVIDER=twilio`, SoulSync sends the OTP through Twilio's Programmable Messaging REST API.

For a Twilio trial account, the destination phone number may need to be verified in Twilio before SMS delivery works.

## OTP configuration

```env
OTP_EXPIRY_MINUTES=10
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_ATTEMPTS=5
```

Do not reduce these protections casually in production.

## Full two-user matrimonial flow

1. Sign in as Ananya.
2. Browse Matches.
3. Send Arjun an interest.
4. Open an incognito/private browser and sign in as Arjun.
5. Open Interests → Received → Accept.
6. Open Ananya's profile and choose **Message if connected**.
7. Keep both windows open and test realtime messaging.
8. Report/block a demo member to test safety controls.
9. Sign in as the admin account and review users/reports.
10. Open Premium and use the development plan switch, or configure Stripe test credentials.

## Stripe setup

Create two recurring Stripe prices and add:

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PREMIUM=price_...
STRIPE_PRICE_PREMIUM_PLUS=price_...
```

Webhook endpoint:

```text
https://YOUR_API_HOST/api/v1/subscriptions/webhook
```

## Backend tests

Requires Java 21+, Maven 3.9+, and Docker because Testcontainers launches PostgreSQL:

```bash
cd backend
mvn clean test
```

`CoreFlowIntegrationTest` verifies the full relationship lifecycle, including email OTP, phone OTP, profiles, interest acceptance, chat, and blocking.

The POM explicitly configures Lombok annotation processing, including for newer JDKs that do not implicitly run processors.

## Frontend checks

```bash
cd frontend
npm install
npm run typecheck
npm run build
```

## CI

`.github/workflows/ci.yml` runs:

- Maven backend tests
- frontend TypeScript checks
- Next.js production build
- Docker Compose smoke test

## Production configuration

Start from `.env.production.example` and supply real secrets. Before deployment run:

```bash
./scripts/production-check.sh
```

When `DEV_MODE=false`, the backend refuses to start if:

- demo seeding is enabled
- the JWT secret is weak/default
- the database password is still the development value
- the frontend URL is not HTTPS
- real email delivery is disabled
- the SMS provider is not Twilio
- Twilio credentials are missing

## Production hardening still recommended before public launch

- Move refresh tokens to Secure, HttpOnly, SameSite cookies instead of browser local storage.
- Add CSRF protection when cookie authentication is enabled.
- Move image storage from local Docker volumes to S3/R2 behind a storage adapter.
- Replace single-instance in-memory rate limiting with Redis-backed distributed rate limiting.
- Add malware scanning and automated image moderation.
- Add optional government-ID/selfie verification if the product requires it.
- Add APNs/FCM push notifications.
- Add observability: centralized logs, tracing, metrics, alerting, Sentry/APM.
- Configure database backups and restore drills.
- Add Terms, Privacy Policy, consent, retention/deletion workflows, and legal/compliance review.
- Add browser E2E tests for critical UI journeys.

## Reset local data

```bash
docker compose down -v --remove-orphans
docker compose up --build -d
```

This deletes the local PostgreSQL and upload volumes, applies Flyway migrations from scratch, and reseeds demo users.

## Upgrade from SoulSync v0.1

You do **not** need to delete your existing database. Flyway automatically applies:

```text
V2__identity_verification.sql
```

which adds phone verification fields and the OTP verification table.

Then rebuild:

```bash
docker compose down --remove-orphans
docker compose up --build -d
./scripts/verify.sh
```

## Networking

The browser calls the same-origin `/api/v1` path. Next.js proxies API traffic to the backend container at `http://backend:8080`, avoiding browser CORS problems for normal API requests.

WebSocket traffic uses `ws://localhost:8080/ws` during local development.
