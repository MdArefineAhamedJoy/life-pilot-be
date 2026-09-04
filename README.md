# Life OS Back End

NestJS API for Life OS with Drizzle ORM and PostgreSQL.

## Scripts

- `pnpm dev` starts the API in watch mode on `API_PORT` or `4000`.
- `pnpm build` builds the Nest app to `dist`.
- `pnpm db:generate` generates Drizzle migrations from `src/db/schema.ts`.
- `pnpm db:migrate` applies migrations to `DATABASE_URL`.
- `docker compose up --build` starts the API and PostgreSQL containers.

## Local Setup

1. Copy `.env.example` to `.env`.
2. Run migrations: `pnpm db:migrate`.
3. Start the API: `pnpm dev`.

## Docker setup

Docker is optional for local development. The compose stack starts both PostgreSQL and the API, and runs migrations before the API starts:

```bash
docker compose up --build
```

The container database is exposed on `POSTGRES_PORT` (default `5433`) to avoid conflicting with a locally installed PostgreSQL server on `5432`. The API remains available on `http://localhost:4000`.

The frontend reads `NEXT_PUBLIC_API_BASE_URL`; set it to `http://localhost:4000/api` for local backend persistence. If it is empty or the API is unavailable, the frontend keeps using its localStorage fallback.

## Main API

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, and `POST /api/auth/logout`
- `GET /api/health` and `GET /api/health/db`
- `GET /api/life-os/state` returns the full app state.
- `PUT /api/life-os/state` replaces the full app state for backup/restore sync.
- `POST /api/life-os/reset` restores the seeded personal data.
- `/api/life-os/categories`, `/expenses`, `/tasks`, `/timer-sessions`, `/notes`, and `/settings` expose focused CRUD routes matching the frontend state model.
- `GET /api/account/profile`, `POST /api/account/profile`, and `POST /api/account/password-recovery` keep the existing account profile flows.

## Authentication and API access

All API routes require `Authorization: Bearer <session-token>` by default. The only intentional public routes are:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/account/password-recovery`
- `GET /api/health` for deployment liveness checks

`GET /api/health/db`, account profile routes, and every Life OS data route are protected. Life OS rows are scoped by the authenticated user ID; apply migration `0003_user_scoped_life_os.sql` before running a multi-user deployment.

## Module Layout

Backend modules are top-level folders under `src`:

- `auth`
- `accounts`
- `categories`
- `expenses`
- `tasks`
- `timer-sessions`
- `notes`
- `settings`
- `life-os-state`
- `shared`
- `db`
- `health`
