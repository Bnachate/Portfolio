---
name: smoke-check
description: Run the app built for production and verify it behaves as expected over HTTP - pages, security headers, SEO files, private data not exposed, writes refused to visitors - locally on port 3100 or against the production domain. Use after a change that affects visitors, security, headers, SEO or routes, or when the user asks to check the site.
---

# Smoke check

Write the checks as a small Node script (`fetch`) in the scratchpad directory, print one `ok` / `FAIL` line per check, and report the results in French. A failure is reported as a failure, never glossed over.

## Local (before shipping)

1. `npm run build`.
2. Start `npx next start -p 3100` in the background. Never use port 3000 (the user's dev server). It opens the local PGlite database: if the user's dev server holds it, ask them to stop it.
3. Wait until `http://localhost:3100` answers, run the checks, then stop the background server.
4. Delete any rows the checks created (test contact messages, `rate_limit_hits`) with a temporary script, then delete that script.

## Production (after the user merges)

Use the production domain (Vercel > Overview > Domains). Deployment URLs with a random hash are frozen snapshots of an old deploy: never check those.

Production checks are **read-only**:
- no POST that stores data (contact form) or hits a rate limit (login): it would add fake messages or lock the user's own IP out for up to an hour;
- a POST with `Origin: null` to `/api/contacts` is safe (rejected with 403 before anything happens) and proves the new code is live.

## Checklist (keep what applies, add the feature's own checks)

- Home page 200, `lang="fr"`, expected `<title>`, feature content present.
- No personal data in the HTML: no phone number, no private email.
- Headers: `Content-Security-Policy` (with `frame-ancestors 'none'`), `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`; no `X-Powered-By`. The CV PDF has no CSP.
- `/robots.txt`, `/sitemap.xml`, `/opengraph-image`, `/icon` answer 200, and absolute URLs use the production domain.
- `/api/hero` has no `email` field for visitors; `/api/contacts` GET is 401.
- Local only: every write route answers 401 without a session; contact and login rate limits answer 429 on the 6th attempt from the same `X-Forwarded-For`.
- `/admin` renders the read-only banner for visitors and no Messages tab.
