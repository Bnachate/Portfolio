---
name: ship
description: Verify, commit and push the current work of this repository on a dedicated branch and give the pull request link. Use when the user says commit, push, "commit & push", ship, or at the end of the implement-feature workflow.
---

# Ship

## 1. Branch

- Never commit on `main`. If the current branch is `main`, create one first: `git switch -c <type>/<short-slug>` (`feat/`, `fix/`, `chore/`, `test/`, `docs/`).
- If the work belongs to a branch that was already merged, start a new branch from `origin/main` (stash, switch, pop) instead of adding to the old one.

## 2. Checks (all must pass before committing)

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Also run `npm run test:e2e` when Playwright is set up and the change touches the UI. If a check fails, fix it; if the failure is unrelated and pre-existing, tell the user instead of hiding it.

## 3. Review what is committed

- `git status` and `git diff`: only intended files. Never commit `.env*` (except `.env.example`), `.pglite*`, `coverage/`, test artifacts or scratch scripts.
- Comments in the diff are in English (including existing ones you touched).

## 4. Commit

Git identity is not configured on this machine. Write the message to a file in the scratchpad directory (PowerShell mangles quotes in `-m`), then:

```bash
git add <files>
git -c user.name="Brafalgar" -c user.email="74974195+Brafalgar@users.noreply.github.com" commit -F <message-file>
```

Message: English, conventional prefix (`feat:`, `fix:`, `chore:`, `test:`, `docs:`), a summary line, then bullets explaining what and why. Mention any manual step (e.g. a production command). End with the co-author trailer given in the session instructions (currently `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).

## 5. Push

`git push -u origin <branch>`. Never force-push `main`, and never force-push any branch without the user's explicit approval. The `gh` CLI is not installed: give the PR link `https://github.com/Bnachate/Portfolio/pull/new/<branch>`.

## 6. Report (in French)

Branch, commit summary, check results (with test counts), PR link, and anything the user must do before or after merging. Do not merge yourself.
