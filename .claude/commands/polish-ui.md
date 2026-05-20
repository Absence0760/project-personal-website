---
description: Polish the UI/UX of a single template, content page, or stylesheet to this site's quality bar — sidebar + page-content layout, footer legal links, mobile-first stacking, the single style.css. Delegates to the `ui-polisher` agent.
argument-hint: <route, template path, or content path>
---

Polish the UI/UX of `$ARGUMENTS` using the `ui-polisher` agent.

## When to use this command

**Right fit:**

- A page where the hierarchy is muddled — the most important thing isn't at the top, or chrome / boilerplate competes with content for the first viewport.
- A long-form content page (notes, legal pages) where the body needs typographic rhythm work — heading spacing, line length, `<dl>`-style structured disclosures for legal-entity / contact blocks.
- A page that doesn't collapse cleanly on mobile — the sidebar should stack, touch targets should be reasonable, the legal pages should remain readable at narrow widths.
- A template leaking raw ISO dates, arbitrary hex colors that should be CSS variables in `style.css`, arbitrary `rem` spacing that breaks rhythm.

**Wrong fit — tell the user and stop:**

- A legal page (`content/terms.md`, `privacy.md`, `refunds.md`, `contact.md`) where the requested polish would renumber sections or change clause wording. That's a `/safe-edit` task, not a polish — refer the user, per `docs/legal-status.md`.
- A request that's really a feature, not a polish — "add a search bar to the notes list" needs a content / functionality plan, not the polish agent.
- An asks-for-everything sweep ("polish all the pages"). Pick one and tell the user to invoke this command again for the next.
- A polish that would add a third-party network call (CDN, font, tracker, form-handler). That's a policy change — surface, refuse, and refer the user to `content/privacy.md`.

## Resolving the target

`$ARGUMENTS` can be:

- A **route slug** (`/`, `/notes/`, `/cv/`, `/contact/`, `/terms/`, `/privacy/`, `/refunds/`, `/tags/`):
  - `/` → `templates/index.html`
  - `/notes/` → `templates/section.html` (notes list with chip filter)
  - `/notes/<slug>/` → `templates/page.html` plus the relevant `content/notes/*.md`
  - `/cv/` → `templates/cv/section.html`
  - `/tags/`, `/tags/<tag>/` → `templates/taxonomy_list.html`, `templates/taxonomy_single.html`
  - `/contact/`, `/terms/`, `/privacy/`, `/refunds/` → the matching file in `content/` (rendered via `templates/page.html`)
- A **file path** (`templates/base.html`, `static/css/style.css`, `content/notes/<slug>.md`) — used as-is.
- A **`style.css` polish** — use `static/css/style.css` directly.

If the argument is empty or "audit", list the candidate pages with a one-line "why this one matters most right now" and ask the user to pick. Don't blanket-sweep.

## The flow

1. **Pre-flight:**
   - Confirm the target file exists. If not, stop and report.
   - Confirm `pnpm build` passes on the working tree before you start — if it's already failing, something else is broken; fix that first.
   - The repo convention is "don't run the dev server to visually verify UI changes" (per `CLAUDE.md`). The agent does not take screenshots; the operator reviews the page in their own browser session.

2. **Resolve target → invoke the agent:**

   Spawn the `ui-polisher` agent with a prompt like:

   > "Polish the UI/UX of `<resolved file path>`. The user's stated intent was: `<the original argument string>`. Follow your agent spec: audit, plan, edit, verify with `pnpm build`, report. Do not commit. If the target is a legal page and the polish would renumber sections or change clause wording, refuse — that's a `/safe-edit` task per `docs/legal-status.md`."

   The agent's spec covers the pattern library, the verify step, and the refuse cases. Trust it.

3. **Relay the agent's report.** When it returns, surface:

   - The list of files changed (run `git diff --stat` to confirm matches).
   - The "Notes for the human" section verbatim — including the agent's request that the user open `pnpm dev` and review the page visually.

4. **Wait for the user's call on the commit.** Do not pre-stage or pre-commit. When the user says yes:

   - Stage the changed files explicitly (don't `git add -A` — risks pulling in `public/` output from `pnpm build`).
   - Commit message follows the repo's recent style seen in `git log --oneline` — `feat(scope):` for new surface, `chore(scope):` for tooling, `fix(scope):` for correctness. **No `Co-Authored-By` / "Generated with Claude Code" / robot-emoji footers** — the user-level rule in `~/.claude/CLAUDE.md` wins.

## Cost reality

This command costs more than a normal edit — a `pnpm build` run and an agent context. Don't burn it on a 5-pixel padding tweak — for that, the user edits directly. The command earns its cost on hierarchy-level changes (a flat content page that wants a `<dl>`, a sidebar that doesn't collapse, a legal page whose `<h2>` spacing has drifted).

## What this command does NOT replace

- `/check` for a pre-commit gate (code-review + test-gap + doc-hygiene).
- `/safe-edit` for changes to legal pages, the homepage services section, the deploy workflow, or anything that adds an external network touch.
- `/audit/*` for periodic broad sweeps (secrets, XSS, deps, accessibility).
- Visual verification. The operator runs `pnpm dev` and reviews the page themselves — that's the repo convention.

## Tone

Don't narrate the agent's internal steps. The user sees:

- A one-sentence "Resolving target → `<path>`. Spawning the polisher."
- The agent's structured report (audit findings + changes + verification + notes), relayed.
- A "Want me to commit?" question with the suggested commit message.
