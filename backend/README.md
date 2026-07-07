# Decifra Backend

Standalone NestJS backend foundation for Decifra 2.0. This is a scaffold only —
no business logic yet, and it is **not** connected to the existing frontend
(`src/`) or Base44 (`base44/`) in this repository.

## Requirements

- Node.js >= 18
- npm

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

## Verify it's running

Visit (or curl) `http://localhost:3001/health` — it should return:

```json
{ "status": "ok" }
```

No database connection is required for this to work.

## Prisma

A placeholder Prisma schema lives at `prisma/schema.prisma` (datasource +
generator only, no models yet). To validate it:

```bash
npx prisma validate
```

`DATABASE_URL` in `.env.example` is a placeholder — it does not need to point
to a real, running database yet.

## Project structure

```
src/
  main.ts             - application entry point
  app.module.ts        - root module, wires everything together
  config/               - environment configuration
  health/               - health check endpoint (GET /health)
  common/               - shared utilities (placeholder)
  auth/                 - authentication (placeholder)
  users/                - user management (placeholder)
  documents/             - document upload & storage (placeholder)
  analysis/              - AI analysis (placeholder)
  billing/               - Stripe billing (placeholder)
  lawyer-review/          - lawyer review workflow (placeholder)
  notifications/          - notifications (placeholder)
```

## Status

Foundation only. All domain modules above are empty placeholders with no
business logic. Not connected to the frontend, a database, or any external
service yet — those are later, separately approved tasks.
