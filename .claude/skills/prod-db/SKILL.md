---
name: prod-db
description: Prepare and guide operations on the production database (Neon) of this portfolio - load or overwrite content, create or reset the admin, seed, one-off backfills. Use when a feature or the user needs data changed in production, not for schema migrations (those run automatically on deploy).
---

# Production database operations

Claude does not have the production connection string, and should not ask for it in the chat. The user runs the commands in their own terminal; Claude prepares them exactly and explains the effect.

## Available operations

| Command | Effect | Destructive |
|---|---|---|
| `npm run db:seed` | Fills an empty database with `scripts/content.ts`; does nothing if experiences exist | No |
| `npm run content:sync` | Replaces all experiences and the hero with `scripts/content.ts` (projects, messages, users kept) | Yes: overwrites admin edits |
| `npm run admin:create -- <email> "<name>"` | Creates the admin or resets its password (`ADMIN_PASSWORD`, 12+ chars) | Resets the password |
| `npm run db:migrate` | Applies migrations (normally automatic on deploy) | No |

For a one-off backfill, write an idempotent script in `scripts/` (same structure as `scripts/sync-content.ts`: `main()`, one transaction, `closeDb()` in `finally`), test it on the local database first, and ship it before asking the user to run it.

## What to give the user (PowerShell)

```powershell
$env:DATABASE_URL = "postgres://...URL Neon (Vercel > Storage > database > .env.local)..."
npm run <command>
Remove-Item Env:DATABASE_URL
```

- Always include the `Remove-Item` line: otherwise later local commands would write to production.
- For `admin:create`, set `$env:ADMIN_PASSWORD` the same way and remove it afterwards; never write the password in the chat, in a file or in a commit.
- Run from the repository root, on a branch that contains the script (usually `main` after merging).
- State what the command will change and what it will not touch. For destructive commands, get an explicit "yes" first.
- Tell the user which success line to expect (each script prints one) and that the site reads the database live (no redeploy needed for content).
