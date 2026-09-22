# SoulSync

SoulSync is a full-stack matrimonial platform focused on serious relationships, compatibility-driven discovery, privacy, and intentional communication.

The project is built as a production-oriented modular monolith with a Next.js frontend and a Spring Boot backend.

## Live deployment

- Frontend: https://dynamic-gelato-916451.netlify.app
- Backend health: https://soulsyncdeploy-api.onrender.com/actuator/health

> The current backend runs on Render. Free instances may cold-start after being idle, so the first request can take longer than normal.

## Tech stack

### Frontend
- Next.js 16.3.3
- React 19
- TypeScript
- Responsive custom UI
- Authenticated REST API integration
- STOMP/WebSocket chat integration

### Backend
- Java 21
- Spring Boot 3.5.16
- Spring Security
- JWT access + refresh tokens
- Spring Data JPA
- Flyway migrations
- STOMP WebSocket messaging
- Maven

### Data and infrastructure
- PostgreSQL
- Neon PostgreSQL in production
- Cloudinary for production profile-photo storage
- Brevo API for production email delivery
- Stripe Checkout + webhooks
- Netlify frontend deployment
- Render backend deployment
- Docker Compose for local development

## Product features

### Authentication and account
- Registration
- 6-digit email verification
- Login and logout
- Access-token and refresh-token flow
- Forgot password
- Reset password
- Account status and role support

Email verification is required before sign-in.

Phone verification is not required for interests, connections, or messaging.

### Matrimonial profiles
- Detailed member profiles
- Profile completion tracking
- Multiple profile photos
- Primary-photo selection
- Photo ordering
- Photo visibility controls
- Profile visibility controls
- Partner preferences
- Recently active status
- Compatibility scoring

### Discovery
- Profile search
- Compatibility recommendations
- Advanced search for eligible Premium members
- Enhanced discovery / Discover+
- Recently active member discovery
- Profile visitors
- Shortlisting

### Interests and connections
- Send interest
- Accept interest
- Decline interest
- Withdraw pending interest
- Mutual connection creation after acceptance
- Connection-based communication

### Messaging
- Persisted conversations
- Connection-only chat
- Real-time STOMP/WebSocket messaging
- Message read state
- Authenticated conversation access

### Safety and privacy
- Block members
- Report profiles
- Profile visibility settings
- Photo visibility settings
- Contact information protected behind eligibility checks
- Contact visibility only for mutually connected eligible members

### Premium

#### Free
- Profile creation
- Standard discovery
- Basic search
- Compatibility recommendations
- Limited simultaneous pending interests

#### Premium
- Unlimited interests
- Advanced search
- Profile visitors
- Contact visibility for eligible mutual connections
- Enhanced discovery

#### Premium Plus
- Everything in Premium
- Profile boost
- Video-call entitlement
- Priority support

The current video-call flow uses a Jitsi-based meeting URL for functional testing. Additional meeting-security hardening is recommended before a public production launch.

## Project structure

```text
SoulSync/
├── backend/
│   ├── src/main/java/com/soulsync/
│   ├── src/main/resources/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   └── package.json
├── scripts/
├── docker-compose.yml
├── netlify.toml
├── .env.example
└── README.md
```

## Local development

### Prerequisites

Install:

- Java 21
- Maven 3.9+
- Node.js 22+
- npm
- Docker Desktop

### 1. Clone the repository

```bash
git clone https://github.com/AbhiZenin/soulsync-Deploy.git
cd soulsync-Deploy
```

### 2. Create the local environment file

```bash
cp .env.example .env
```

Do not commit `.env` or any production secrets.

### 3. Start with Docker Compose

```bash
docker compose up --build -d
```

Check the services:

```bash
docker compose ps
```

Typical local URLs:

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- API health: http://localhost:8080/actuator/health
- Mailpit: http://localhost:8025

### Stop the local stack

```bash
docker compose down
```

To also remove local database volumes:

```bash
docker compose down -v --remove-orphans
```

## Run the backend directly

```bash
cd backend
mvn clean package -DskipTests
mvn spring-boot:run
```

## Run the frontend directly

```bash
cd frontend
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Important environment variables

The repository should contain examples only. Never commit real secrets.

```env
DATABASE_URL=
DATABASE_USERNAME=
DATABASE_PASSWORD=

JWT_SECRET=

FRONTEND_URL=

DEV_MODE=false
SEED_DEMO=false

MAIL_ENABLED=true
MAIL_FROM=
BREVO_API_KEY=

PHOTO_STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PREMIUM=
STRIPE_PRICE_PREMIUM_PLUS=

SOULSYNC_VIDEO_BASE_URL=https://meet.jit.si
```

Your actual production environment may contain additional configuration values.

## Email delivery

Local development can use Mailpit.

Production email verification and password-reset delivery use the configured email provider. The current production deployment uses Brevo's HTTPS API.

Keep sender addresses and API credentials in environment variables.

## Profile-photo storage

Local development can use local storage.

Production uses Cloudinary through the application's storage abstraction.

Never expose Cloudinary API secrets in frontend environment variables.

## Stripe

SoulSync supports Stripe Checkout for Premium and Premium Plus.

Expected environment variables:

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PREMIUM=
STRIPE_PRICE_PREMIUM_PLUS=
```

Webhook endpoint:

```text
https://YOUR_BACKEND_HOST/api/v1/subscriptions/webhook
```

Use Stripe test credentials during development.

Before using live billing, subscription lifecycle handling should be reviewed for:

- subscription updates
- failed payments
- cancellation / period-end behavior
- duplicate subscription prevention
- webhook idempotency
- customer billing portal access

## Demo data

The repository contains fictional demo profile imagery for development and UI previews.

Any demo reviews, member names, profile photos, or testimonials used in the interface are illustrative and should not be represented as real customer endorsements.

Keep production demo seeding disabled unless a production-safe seeding workflow has been intentionally configured:

```env
SEED_DEMO=false
```

Do not rely on predictable development accounts or passwords in a public production environment.

## Deployment

### Frontend — Netlify

The root `netlify.toml` configures the Next.js frontend.

Production frontend variables include:

```env
NEXT_PUBLIC_API_URL=https://soulsyncdeploy-api.onrender.com/api/v1
NEXT_PUBLIC_WS_URL=wss://soulsyncdeploy-api.onrender.com/ws
```

### Backend — Render

The backend runs as a Dockerized Spring Boot service.

Important production settings include:

```env
DEV_MODE=false
SEED_DEMO=false
FRONTEND_URL=https://dynamic-gelato-916451.netlify.app
```

The production database is hosted on Neon PostgreSQL.

## Health checks

```bash
curl https://soulsyncdeploy-api.onrender.com/actuator/health
```

Expected response:

```json
{
  "status": "UP"
}
```

## Verification before pushing

Backend:

```bash
cd backend
mvn clean package -DskipTests
```

Frontend:

```bash
cd frontend
npm run build
```

Repository checks:

```bash
cd ..
git diff --check
git status
```

## Security notes

Before a large public launch, continue hardening the platform in areas such as:

- Secure, HttpOnly cookie-based refresh-token storage
- CSRF protection if cookie authentication is introduced
- distributed rate limiting
- stronger video-call access controls
- automated image moderation
- malware scanning
- audit logging
- centralized error monitoring and alerting
- database backup and restore testing
- account deletion and data export workflows
- legal/privacy/terms/safety documentation
- browser E2E tests for critical journeys

## Current deployment notes

The application is actively being developed.

The current Render backend may cold-start after inactivity. Once awake, authenticated API requests are normally much faster. The frontend includes a backend warm-up experience to make this less disruptive to users.

## Development philosophy

SoulSync is designed around a simple product flow:

```text
Create a profile
      ↓
Discover compatible members
      ↓
Send an interest
      ↓
Connect when interest is mutual
      ↓
Start a conversation
```

The goal is to keep matrimonial discovery intentional without making the product feel like a long form or an endless swipe interface.

## License

This repository is currently maintained as the SoulSync application project. Add an explicit open-source license before distributing the code under an open-source license.
