# EventForge

EventForge is a **webhook ingestion + delivery** app built with **Next.js (App Router)**, **PostgreSQL + Prisma**, and **Upstash QStash** for reliable background delivery and replays.

It lets you:
- Define **webhook endpoints** (a target URL + metadata)
- **Ingest** events (store payload + headers)
- **Deliver** events to the destination URL
- Track delivery status (**PENDING / DELIVERED / FAILED**) and **delivery attempts**
- **Replay** a webhook event (re-queue delivery via QStash)

---

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript / React
- **Database**: PostgreSQL
- **ORM**: Prisma (with `@prisma/adapter-pg`)
- **Queue / Delivery**: Upstash **QStash**
- **UI**: Tailwind CSS + Radix UI (shadcn-style components)

---

## High-Level Architecture

### Components

- **Next.js App (UI + API routes)**
  - Dashboard pages under `app/dashboard/*`
  - Server actions in `app/actions.ts`
  - API routes under `app/api/*`
- **PostgreSQL**
  - Stores endpoints, webhook events, and delivery attempts
- **QStash**
  - Handles asynchronous delivery and retries
  - Event replays are re-queued into QStash

### Delivery Flow (simplified)

1. **Webhook received** (ingestion endpoint)
2. App **persists** event data in Postgres via Prisma
3. App **queues** a delivery job to **QStash**
4. QStash calls **`POST /api/worker`**
5. Worker fetches the stored event + endpoint and **POSTs to the target URL**
6. Worker stores a **DeliveryAttempt** and updates event status to **DELIVERED** or **FAILED**
7. If failed, worker returns **500** so QStash can retry (based on QStash settings)

### Replay Flow

1. User clicks replay in UI
2. Server action `replayWebhook(eventId)` updates status back to **PENDING**
3. Server action publishes a QStash job to call **`/api/worker`**
4. Worker re-delivers and logs another attempt

---

## Data Model (Prisma)

The database schema lives in `prisma/schema.prisma` and includes:

- `WebhookEndpoint`
  - `targetUrl`, `secret`, `provider`, `description`, timestamps
- `WebhookEvent`
  - links to an endpoint
  - stores `payload` and `headers` as JSON
  - `status`: `PENDING | DELIVERED | FAILED`
- `DeliveryAttempt`
  - linked to a `WebhookEvent`
  - stores `responseStatus` and truncated `responseBody`

---

## Project Structure

```txt
.
├── app/
│   ├── actions.ts                 # server actions (ex: replay)
│   ├── api/
│   │   ├── worker/route.ts         # delivers events to target URL
│   │   └── ingest/                 # ingestion route folder exists (implementation may vary)
│   ├── components/
│   │   ├── AutoRefresh.tsx
│   │   └── ReplayButton.tsx
│   ├── dashboard/
│   │   ├── page.tsx                # lists endpoints
│   │   ├── [endpointId]/           # exists in repo (dynamic route)
│   │   └── event/[eventId]/        # exists in repo (dynamic route)
│   ├── globals.css
│   └── layout.tsx
├── components/
│   └── ui/                         # shared UI components (Radix/shadcn style)
├── lib/
│   ├── prisma.ts                   # Prisma client + pg adapter
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
├── package.json
└── next.config.ts
```

---

## Setup

### Prerequisites

- Node.js (recommended: latest LTS)
- PostgreSQL database
- An Upstash QStash account + token

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file in the project root:

```bash
# PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"

# Upstash QStash
QSTASH_TOKEN="YOUR_QSTASH_TOKEN"
```

Notes:
- `DATABASE_URL` is required by Prisma and the pg adapter (`lib/prisma.ts`).
- `QSTASH_TOKEN` is required for replay + queue publishing (`app/actions.ts`).

### 3) Set up the database (Prisma)

Generate Prisma client:

```bash
npx prisma generate
```

Run migrations (choose the command that matches your workflow):

```bash
npx prisma migrate dev
```

(Optional) Seed sample data:

```bash
npx prisma db seed
```

> The UI dashboard mentions seeding if no endpoints exist.

### 4) Run the app

```bash
npm run dev
```

Open:

- `http://localhost:3000`

---

## API

### `POST /api/worker`

This route is intended to be called by QStash (and can be used locally for testing).

**Request body:**
```json
{ "eventId": "..." }
```

**Behavior:**
- Loads the webhook event + endpoint from DB
- Sends `POST` to the endpoint’s `targetUrl`
- Stores a `DeliveryAttempt`
- Updates status: `DELIVERED` if 2xx else `FAILED`
- Returns `500` on failed delivery to encourage QStash retry

---

## Dashboard

### `GET /dashboard`

Shows a list of webhook endpoints and total event counts per endpoint.

Other dynamic routes exist in the repo:
- `app/dashboard/[endpointId]/...`
- `app/dashboard/event/[eventId]/...`

(These typically show per-endpoint events and per-event details / attempts.)

---

## Development Notes

- Prisma client is created in `lib/prisma.ts` and cached globally in non-production to avoid hot-reload connection issues.
- Replay uses a server action (`app/actions.ts`) and publishes a QStash job targeting `/api/worker`.
- Tailwind CSS is configured via `tailwind.config.js`.

---

## Scripts

From `package.json`:

```bash
npm run dev      # start dev server
npm run build    # build production bundle
npm run start    # start production server
npm run lint     # run eslint
```

---
