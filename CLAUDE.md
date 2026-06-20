# CLAUDE.md

Guidance for Claude Code working in this repository. Keep this file short — it loads into every conversation.

## What this repo is

A **professional services website** at [jaredhoward.com](https://jaredhoward.com), built with [Zola](https://www.getzola.org/) and deployed to GitHub Pages. It markets Jared Howard's custom web/software-development practice to two audiences: small-business clients and federal buyers via SAM.gov. There is **no backend, no database, no payment integration in this codebase, and no PII storage** — the only deployed artefacts are HTML, CSS, a small first-party JS bundle, and a CV PDF.

Content pages: **Home** (`templates/index.html`), **Services** (`content/services.md`), **Capability Statement** (`content/capabilities.md` — the federal one-pager; UEI/CAGE rows are added to its corporate-data block once SAM.gov registration completes, see `docs/sam-gov-checklist.md`), **CV** (`content/cv/`), plus the legal pages. Marketing/legal pages render through the clean prose template `templates/page.html`.

The site also serves as the public business URL for Stripe sign-up. That means the legal pages under `/content/` (`terms.md`, `privacy.md`, `refunds.md`, `contact.md`) are load-bearing and changes to them need the discipline laid out in `docs/legal-status.md`.

## Stack at a glance

- **Generator:** Zola (pinned to `0.19.2` in `.github/workflows/ci.yml` + `deploy.yml`).
- **Templates:** Tera, under `templates/`.
- **Content:** Markdown with TOML front-matter, under `content/`.
- **Client JS:** vanilla, under `static/js/`. No bundler, no test framework.
- **Deploy:** `actions/deploy-pages` on push to `main` (`.github/workflows/deploy.yml`).
- **Local dev:** `pnpm dev` (live reload) / `pnpm build` (outputs to `public/`) / `pnpm check`. The root `package.json` is a thin pnpm wrapper around `zola serve` / `zola build` / `zola check` — declares no dependencies, exists for muscle-memory consistency with the rest of the repos on this workstation. See `docs/run-locally.md`.

## Repo-wide hard rules

- **No backend, no secrets in this repo.** If a feature needs server logic or a key, it doesn't belong here — the site stays static. Pre-commit gitleaks (`.pre-commit-config.yaml`) catches accidents; don't bypass with `--no-verify`.
- **No third-party trackers or analytics without updating `content/privacy.md` first.** The Privacy Policy (§4 and §8) commits the site to being first-party only. A `<script src>` to a third-party analytics / fonts / chat widget / etc. is a policy change before it's a code change.
- **Legal pages have a maintenance discipline.** `docs/legal-status.md` is the pre-counsel tracker. Don't materially edit `terms.md`, `privacy.md`, `refunds.md`, or `contact.md` without re-running through that tracker — see its "Maintenance rhythm" section.
- **GitHub-Pages deploy is HTTPS-enforced, custom-domain-locked.** Don't change `static/CNAME` or `base_url` in `config.toml` without following `docs/domain-setup.md`.

## Every code change updates docs in the same change

There is no test framework here, so the tests-and-docs rule reduces to:

1. Update the relevant file in `docs/` if the change affects layout, commands, deploy, or features. A one-line doc edit is still an edit.
2. If the change touches a legal page or its underlying commitments, update `docs/legal-status.md` to reflect what moved.

Treat "code changed, docs unchanged" as an incomplete task — flag it before handing back.

## UI verification

Don't spin up the dev server to visually verify UI changes before reporting a task complete. `pnpm build` (`zola build`) succeeding + the CI build check (`.github/workflows/ci.yml`) are enough; the operator reviews visuals themselves. Only run `pnpm dev` (`zola serve`) if explicitly asked.

## Available Claude tooling

Run these as slash-commands. Each delegates to a specialised agent in `.claude/agents/`.

- `/check` — runs `code-reviewer` + `test-gap-checker` + `doc-hygiene-checker` against the working diff.
- `/safe-edit` — fix-and-review loop for load-bearing changes (legal pages, deploy workflow, CSP-shaped HTML).
- `/polish-ui` — typography / layout polish on a target template or page.
- `/release-readiness` — go/no-go checklist before tagging.
- `/audit/<area>` — focused sweeps. The areas wired here are the ones that fit a static site: `secrets`, `xss`, `deps`, `cookie-consent`, `third-party-data-flows`, `accessibility`. `/audit/all` runs every wired area.

## Where to look

- `docs/run-locally.md` — `zola serve` / `zola build` quick reference.
- `docs/domain-setup.md` — how the GitHub Pages + Route 53 + custom domain wiring was set up.
- `docs/email-setup.md` — email for `@jaredhoward.com` is hosted by **Migadu** (managed IMAP/SMTP; self-hosting was rejected). The MX/SPF/DKIM/DMARC records live in the **manually-managed** `jaredhoward.com` Route 53 zone (this `project-personal-website` account) — no Terraform yet. Read before touching DNS or the contact address.
- `docs/legal-status.md` — pre-counsel tracker for the four legal pages; **read before editing any of them**.
- `docs/sam-gov-checklist.md` — what to obtain (UEI, CAGE, NAICS, certs) to replace the capability-statement placeholders once SAM.gov registration is done.
- `docs/smooth-transitions.md` — feature note for `static/js/transitions.js` (the one remaining bit of client JS).
- `.github/workflows/ci.yml` — PR build gate (Zola build).
- `.github/workflows/deploy.yml` — push-to-main deploy to GitHub Pages.
- `.github/workflows/gitleaks.yml` — secret scanning.
- `.github/workflows/codeql.yml` — CodeQL static analysis (JS + Actions).
- `.github/workflows/scorecard.yml` — OSSF Scorecard.
- `.github/workflows/claude.yml` — Claude Code automation on PRs/issues (operator-gated).
- `.github/workflows/dependabot-auto-merge.yml` — auto-merges minor/patch Dependabot Action bumps.
- `.github/dependabot.yml` — GitHub Actions version updates (only ecosystem in scope here).
- `SECURITY.md` — vulnerability reporting policy.
