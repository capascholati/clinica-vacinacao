# Base44 Development Setup

## Stack
- **Backend**: Node.js + Express + TypeScript (`ts-node-dev` for live reload), port 3333.
- **Frontend**: React + TypeScript + Vite (dev server), port 5173 mapped to host 3000.
- **Database**: PostgreSQL 16 (compose service `db`), credentials inline in compose.

## Architecture — Single-Origin Wiring
The frontend dev server (Vite) proxies all API routes to the backend via
`server.proxy` in `frontend/vite.config.ts`. Frontend fetch calls use **relative
URLs** (e.g. `/auth/login`), not `http://localhost:3333`. Only port 3000 is
public; the backend is internal to the Docker network.

Proxied path prefixes: `/auth`, `/usuarios`, `/cadastros`, `/agenda`,
`/clientes`, `/financeiro`, `/api`.

## Current State of the Code
- The backend (`backend/src/index.ts`) is a **stub** with only a `/api/health`
  endpoint. The README describes a full auth/CRM system, but those routes are
  not yet implemented. API calls from the frontend will return 404 until the
  backend is fleshed out.
- PostgreSQL runs with all four SQL migrations applied (one-shot `migrations`
  service, idempotent — skips if the `perfis` table already exists).
- The backend stub does not connect to PostgreSQL yet; `DATABASE_URL` is
  wired for when it does.
- No `npm run seed` script exists in `backend/package.json` despite the README
  mentioning it.

## No External Secrets Required
The current code uses no external services. PostgreSQL credentials are local
infra, generated inline in `docker-compose.base44.yml`. When the backend
implements JWT auth, a `JWT_SECRET` will be needed — add it via `set_secrets`
at that point.

## Native Module Note
`argon2` (backend dependency) is a native addon requiring build tools. The
`node:22` full image (not `-slim`) is used for the backend service to ensure
compilation succeeds.

## Commands
```bash
# Start everything
docker compose -f docker-compose.base44.yml up -d

# Check status
docker compose -f docker-compose.base44.yml ps

# View logs
docker compose -f docker-compose.base44.yml logs -f backend web

# Rebuild after dependency changes
docker compose -f docker-compose.base44.yml up -d --build
```
