# CLAUDE.md

Guidance for Claude Code working in this repository. Keep this file short — it loads into every conversation.

## What this repo is

A **professional services website** at [jaredhoward.com](https://jaredhoward.com), built with [SvelteKit](https://svelte.dev/docs/kit) (static, `adapter-static`) and deployed to GitHub Pages. It markets Jared Howard's custom web/software-development practice to two audiences: small-business clients and federal buyers via SAM.gov. There is **no backend, no database, no payment integration in this codebase, and no PII storage** — the whole site is prerendered to static HTML/CSS/JS plus a CV PDF (`build/cv.pdf`, generated from the `/cv/` page at build time by `pnpm build:pdf` — not a committed file).

Content pages, each a hand-written Svelte component under `src/routes/`: **Home** (`src/routes/+page.svelte` — a full-bleed landing composition with its own hero and section bands; see `docs/design-system.md` → "Landing page"), **Services** (`src/routes/services/`), **Work** (`src/routes/work/` — every project in `site.ts`, where the home page shows only the three flagged `featured`), **Capability Statement** (`src/routes/capabilities/` — the federal one-pager; UEI/CAGE rows are added to its `<dl class="capability-data">` block once SAM.gov registration completes, see `docs/sam-gov-checklist.md`), **CV** (`src/routes/cv/`), plus the legal pages. Every page shares the `src/routes/+layout.svelte` shell — a masthead (`SiteHeader`) above and a footer card (`LandingFooter`) below. Home renders its own full-bleed `<main>`; every other route gets the centred reading column (`<main class="page">`) and uses the `.prose` layout. The old sidebar rail is gone.

The site also serves as the public business URL for Stripe sign-up. That means the legal-page routes (`terms/`, `privacy/`, `refunds/`, `contact/` under `src/routes/`) are load-bearing and changes to them need the discipline laid out in `docs/legal-status.md`.

## Stack at a glance

- **Framework:** SvelteKit 2 + Svelte 5 (runes), `@sveltejs/adapter-static` with full prerender + `trailingSlash: 'always'`. TypeScript. Versions pinned in `package.json`.
- **Routes/components:** `src/routes/**/+page.svelte` (one per page) + `src/lib/` (`SiteHeader`/`LandingFooter`/`Monogram`/`Icon` for the site-wide shell; `HeroRibbon`/`WorkRow`/`WorkThumb` plus the `reveal` and `spotlight` actions for the landing page; `site.ts` metadata). No Markdown/CMS — pages are hand-authored Svelte.
- **Styling:** a single global stylesheet `src/app.css`, imported once in the layout. One token layer (`--l-*` palette, `--s-*`/`--fs-*`/`--r-*`/`--ease-*` scales) under the `DESIGN TOKENS + LANDING PAGE` banner drives the whole site in both schemes; the reading-column rules at the top of the file consume it. A contrast table sits above the tokens and is computed from the hex beside it — recompute it when you change a colour.
- **Build tooling:** Vite; Vitest for unit tests; `svelte-check` for types. pnpm workspace of one.
- **Deploy:** `actions/deploy-pages`, **release-gated** — fires on a published GitHub Release (or manual `workflow_dispatch`), **not** on push to `main` (`.github/workflows/deploy.yml`). Pushing to `main` does not change the live site; cut a release to publish.
- **Local dev:** `pnpm install` then `pnpm dev` (Vite dev server, live reload) / `pnpm build` (prerenders to `build/`) / `pnpm build:pdf` (renders `build/cv.pdf` from the built CV page; needs `pnpm exec playwright install chromium` once) / `pnpm check` (svelte-check) / `pnpm test` (Vitest). See `docs/run-locally.md`.

## Repo-wide hard rules

- **No backend, no secrets in this repo.** If a feature needs server logic or a key, it doesn't belong here — the site stays static. Pre-commit gitleaks (`.pre-commit-config.yaml`) catches accidents; don't bypass with `--no-verify`.
- **No third-party trackers or analytics without updating the Privacy page (`src/routes/privacy/`) first.** The Privacy Policy (§4 and §8) commits the site to being first-party only. Adding a `<script src>` / external stylesheet / font / chat widget to a third-party host is a policy change before it's a code change.
- **Legal pages have a maintenance discipline.** `docs/legal-status.md` is the pre-counsel tracker. Don't materially edit the `terms/`, `privacy/`, `refunds/`, or `contact/` routes without re-running through that tracker — see its "Maintenance rhythm" section.
- **GitHub-Pages deploy is HTTPS-enforced, custom-domain-locked.** Don't change `static/CNAME` or the site `url` in `src/lib/site.ts` (canonical links + sitemap origin) without following `docs/domain-setup.md`.

## Root package.json scripts — estate format

Root `scripts` follow the estate-wide format canonized in the templates repo's `base` CLAUDE.md; the exemplar is `project-running/package.json` — read it before restructuring this repo's scripts:

- `"//-- <group> --": "<one-line description>"` comment-key dividers above each cluster; the description carries load-bearing facts (ports, prerequisites, doc pointers), not filler.
- Verb-first, colon-namespaced names: `dev`/`preview`, `build`, `check[:*]`, `test[:*]` (`test:scripts` is the format guard). Long-running services would reuse the lifecycle verbs `up`/`down`/`status`/`logs`.
- JSON holds one-liners only — anything longer delegates to a script under `scripts/` (or `bin/`).
- New scripts join an existing group (or add a new `//--` divider in the right place); never append ungrouped entries at the bottom.
- `test:scripts` (`scripts/check_root_scripts.mjs`) validates this format on every CI run — it asserts the CI-contract scripts (`dev`/`build`/`check`/`test`) exist and that every real script sits under a `//--` divider. Renaming a script must update every caller (CI workflows, docs) in the same change.

## Merging & branch protection

`main` follows the estate "sealed main + CI gate" standard: every change reaches `origin/main` through a PR — **no direct pushes** (enforced on admins, including the owner). Merging requires a green **`CI gate`** status check — the single required check, an aggregator job present in each functional CI workflow that `needs:` that workflow's jobs. There are **0 required approvals** — a green CI is the merge gate, not a human sign-off. Force-pushes, branch deletion, and unresolved conversations are blocked; history is linear. Commit locally per-piece, but land via a CI-gated PR.

## Every code change updates docs (and tests) in the same change

1. If the change has a testable unit (e.g. `src/lib/` logic), add or update a Vitest `*.test.ts` beside it.
2. Update the relevant file in `docs/` if the change affects layout, commands, deploy, or features. A one-line doc edit is still an edit.
3. If the change touches a legal page or its underlying commitments, update `docs/legal-status.md` to reflect what moved.

Treat "code changed, docs unchanged" as an incomplete task — flag it before handing back.

## UI verification

Don't spin up the dev server to visually verify UI changes before reporting a task complete. `pnpm build` succeeding + `pnpm check` + the CI checks (`.github/workflows/ci.yml`) are enough; the operator reviews visuals themselves. Only run `pnpm dev` if explicitly asked.

## Available Claude tooling

Run these as slash-commands. Each delegates to a specialised agent in `.claude/agents/`.

- `/check` — runs `code-reviewer` + `test-gap-checker` + `doc-hygiene-checker` against the working diff.
- `/safe-edit` — fix-and-review loop for load-bearing changes (legal pages, deploy workflow, CSP-shaped HTML).
- `/polish-ui` — typography / layout polish on a target template or page.
- `/release-readiness` — go/no-go checklist before tagging.
- `/audit/<area>` — focused sweeps. The areas wired here are the ones that fit a static site: `secrets`, `xss`, `deps`, `cookie-consent`, `third-party-data-flows`, `accessibility`. `/audit/all` runs every wired area.

## Where to look

- `docs/run-locally.md` — `pnpm dev` / `pnpm build` / `pnpm check` / `pnpm test` quick reference.
- `docs/design-system.md` — the visual language (tokens, focal hierarchy, the two landing compositions, the reading column, the hero graphic, motion, a11y) that lives in the single `src/app.css`. Read before restyling; **system fonts only** — no external font/script (Privacy rule).
- `src/lib/site.ts` — site metadata (title, `role` for the masthead lockup, description, `url` for canonical/sitemap, `github`/`email`, primary + footer nav, and the `projects` list with the `kind`/`cardBlurb`/`featured`/`thumb` fields the home page's work cards render). The old `config.toml` lives here now.
- `docs/domain-setup.md` — how the GitHub Pages + Route 53 + custom domain wiring was set up.
- `infra/` — **Terraform for the `jaredhoward.com` Route 53 zone** (the only AWS resource in this account; the site itself is GitHub Pages). `infra/bootstrap` creates the S3 state bucket; `infra/dns` holds the zone + all records, adopted from the live zone by `terraform import`. Applied locally with `AWS_PROFILE=personal-website`. **DNS is no longer hand-edited in the console** — see `infra/README.md`. No `infra-secrets` subdir: a static site with public DNS has nothing to encrypt.
- `docs/todo.md` — infra/DNS backlog: the `infra/` Terraform adoption (applied 2026-07-10; zone is live-managed by Terraform now) and the **cross-repo `disag.jaredhoward.com` delegation** that this repo and `project-disag` must keep in sync.
- `docs/email-setup.md` — email for `@jaredhoward.com` is hosted by **Migadu** (managed IMAP/SMTP; self-hosting was rejected). The MX/SPF/DKIM/DMARC records live in the `jaredhoward.com` Route 53 zone (this `project-personal-website` account), now **codified in `infra/dns`** (Terraform). Read before touching DNS or the contact address.
- `docs/legal-status.md` — pre-counsel tracker for the four legal pages; **read before editing any of them**.
- `docs/sam-gov-checklist.md` — what to obtain (UEI, CAGE, NAICS, certs) to replace the capability-statement placeholders once SAM.gov registration is done.
- `docs/smooth-transitions.md` — feature note for the page cross-fade (now the View Transitions API, wired in `src/routes/+layout.svelte`).
- `.github/workflows/ci.yml` — PR gate: `pnpm check` + `pnpm test` + `pnpm build`, aggregated by the required `CI gate` job.
- `.github/workflows/deploy.yml` — release-gated deploy to GitHub Pages (builds `build/`, publishes on a GitHub Release / manual dispatch, not on push to `main`).
- `.github/workflows/gitleaks.yml` — secret scanning.
- `.github/workflows/codeql.yml` — CodeQL static analysis (JS/TS + Actions).
- `.github/workflows/scorecard.yml` — OSSF Scorecard.
- `.github/workflows/claude.yml` — Claude Code automation on PRs/issues (operator-gated).
- `.github/workflows/dependabot-auto-merge.yml` — auto-merges minor/patch Dependabot bumps (npm + Actions).
- `.github/dependabot.yml` — npm (Svelte toolchain) + GitHub Actions version updates.
- `SECURITY.md` — vulnerability reporting policy.
