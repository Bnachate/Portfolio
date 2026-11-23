# Portfolio

Personal portfolio website showcasing my projects, skills and experiences.

Full-stack Next.js app: the public site, the admin panel and the API (`app/api/*`) live in the same project.

## Stack

- **Next.js 16** (App Router): public pages rendered on the server, API in route handlers
- **PostgreSQL** with **Drizzle ORM** (`server/db/schema.ts`)
- **Auth**: single admin, session JWT in an `HttpOnly` cookie (`jose` + `bcryptjs`)
- **Validation**: `zod` (`server/validation.ts`)

```
app/            pages, components and API route handlers (app/api)
server/         server-only code: db, auth, services, validation
drizzle/        generated SQL migrations
scripts/        db:migrate, db:seed, admin:create
proxy.ts        redirects /admin to the login page without a session
```

## Local development

No database to install: without `DATABASE_URL`, the app uses **PGlite**, an embedded Postgres stored in `./.pglite`.

```bash
npm install
cp .env.example .env.local          # then fill in SESSION_SECRET
npm run db:migrate                  # create the tables
npm run db:seed                     # optional: initial experiences, tags and hero
ADMIN_PASSWORD='a-long-password' npm run admin:create -- you@example.com "Your Name"
npm run dev
```

> PGlite can only be opened by one process at a time: stop `npm run dev` before running the `db:*` / `admin:create` scripts.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run db:generate` | Generate a SQL migration after changing `server/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Fill an empty database with the initial content |
| `npm run admin:create -- <email> [name]` | Create the admin, or reset its password (`ADMIN_PASSWORD` env var) |

## API

Responses are `{ data }` on success and `{ message }` on error. 🔒 = admin session required.

| Route | Methods |
|---|---|
| `/api/auth/login` · `/api/auth/logout` · `/api/auth/me` | `POST` · `POST` · `GET` 🔒 |
| `/api/projects` · `/api/projects/:id` | `GET`, `POST` 🔒 · `PATCH` 🔒, `DELETE` 🔒 |
| `/api/experiences` · `/api/experiences/:id` | `GET`, `POST` 🔒 · `PATCH` 🔒, `DELETE` 🔒 |
| `/api/tags` · `/api/tags/:id` | `GET`, `POST` 🔒 · `DELETE` 🔒 |
| `/api/contacts` · `/api/contacts/:id` | `GET` 🔒, `POST` (contact form) · `PATCH` 🔒, `DELETE` 🔒 |
| `/api/hero` | `GET`, `PUT` 🔒 |

## Deployment (Vercel)

1. Create a PostgreSQL database (Neon, Supabase, Railway...) and copy its **pooled** connection string.
2. Import the GitHub repository in Vercel and set the environment variables:
   - `DATABASE_URL`
   - `SESSION_SECRET` (at least 32 random characters)
3. From your machine, apply the migrations and create the admin on the production database:
   ```bash
   DATABASE_URL='postgres://...' npm run db:migrate
   DATABASE_URL='postgres://...' npm run db:seed
   DATABASE_URL='postgres://...' ADMIN_PASSWORD='...' npm run admin:create -- you@example.com "Your Name"
   ```
4. Every push to `main` is deployed automatically.
