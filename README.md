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

The frontend server reads `API_BASE_URL` (legacy `NEXT_PUBLIC_API_BASE_URL` fallback). Set it to `http://127.0.0.1:4000/api`. Browser requests go through the Next.js same-origin API proxy with an HttpOnly session cookie. API failures are shown to users; there is no shared localStorage fallback.

## Vercel deployment

The API is packaged as a Vercel serverless function at `api/[...path].ts`; all existing endpoints remain under `/api`, for example `/api/health`.

Set these Vercel environment variables before deploying:

- `DATABASE_URL` — the production PostgreSQL connection string.
- `DATABASE_SSL=true` — required by most hosted PostgreSQL providers.
- `CORS_ORIGIN` — your deployed frontend URL, for example `https://your-app.vercel.app`.

Then run `pnpm db:migrate` against the production database and deploy with `npx vercel --prod`.

## Main API

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, and `POST /api/auth/logout`
- `GET /api/health` and `GET /api/health/db`
- `GET /api/life-os/state` returns the full app state.
- `PUT /api/life-os/state` replaces the full app state for backup/restore sync.
- `POST /api/life-os/reset` clears only the authenticated user's workspace. New accounts have no seeded personal data.
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

## Integration checks

Build both repositories, then run `pnpm test:integration` in `life-os-ai`. Tests use an isolated PostgreSQL schema and cover browser forms, protected pages, CRUD, cross-user isolation, backups, validation, and logout. Existing user data is untouched.

Password recovery returns HTTP 501 until email delivery and token redemption are implemented. Profile reads in settings and snapshots use the authenticated account identity. JSON requests accept up to 2 MB for profile images and backups.
