# Audit commands

Project-curated slash commands for running periodic security, dependency, and compliance audits on this repo — a Zola static site at `jaredhoward.com`, deployed to GitHub Pages, that doubles as a Stripe business URL.

Most of the audit areas are dramatically smaller than they would be on a SaaS — there is no backend, no database, no infrastructure-as-code, no payment integration, no PII storage. The `infra` and `cost-controls` audits are intentional no-ops; the `gdpr` / `data-export-completeness` / `account-deletion-completeness` audits confirm that the legal-page commitments still match a site that has nothing to export or delete.

Invoke from a Claude Code session as `/audit/<name>`.

## Index

### Security

| Command | What it checks |
|---|---|
| [/audit/secrets](secrets.md) | Anything secret-shaped in git history, in the committed working tree, in GitHub Actions workflow files, or in a public asset |
| [/audit/xss](xss.md) | Tera template `\| safe` filter usage, client JS in `static/js/` that interpolates URL fragments / query params, raw `<script>` in Markdown content |

### Health

| Command | What it checks |
|---|---|
| [/audit/deps](deps.md) | GitHub Actions pinning, Dependabot coverage, action-version drift (this repo has no language deps — only Actions) |
| [/audit/infra](infra.md) | **N/A** — this site has no infra-as-code. Command returns a one-line "N/A; GitHub Pages serves the bundle". Kept for future use |
| [/audit/cost-controls](cost-controls.md) | **N/A** — GitHub Pages free tier, no AWS, no metered SaaS. Command returns a one-line N/A. Kept for future use |

### Compliance

| Command | What it checks |
|---|---|
| [/audit/cookie-consent](cookie-consent.md) | Any third-party SDK / fetch / font / pixel fires on page load — should be empty per `content/privacy.md` §4 + §8 |
| [/audit/third-party-data-flows](third-party-data-flows.md) | Outbound network touches the deployed bundle makes — should be empty or only the GitHub Pages CDN |
| [/audit/gdpr](gdpr.md) | Posture confirmation: site is US-targeted, no PII, no analytics, no consent banner needed because no cookies |
| [/audit/data-export-completeness](data-export-completeness.md) | Posture confirmation: nothing to export — confirm `content/privacy.md` still says so |
| [/audit/account-deletion-completeness](account-deletion-completeness.md) | Posture confirmation: no accounts — confirm `content/privacy.md` still says so |
| [/audit/accessibility](accessibility.md) | WCAG 2.2 AA on the deployed bundle — heading hierarchy, alt text, chip-filter keyboard nav, contrast |

### Dispatcher

| Command | What it does |
|---|---|
| [/audit/all](all.md) | Spawns every wired audit in parallel + consolidated report. Skips the infra / cost-controls no-ops |

## Conventions

- Every audit is **read-only by default**. The deliverable is a findings report, not a diff.
- Findings are grouped by severity: **Critical / High / Medium / Low**.
- Each command is a **self-contained prompt** — runnable from a fresh session with no prior context.
- Cross-references: findings tie back to `CLAUDE.md` rules or `content/privacy.md` policy commitments whenever they map there.

## Agent delegation

The **secrets**, **xss**, and **deps** commands delegate to the `repo-security-auditor` agent (under `.claude/agents/`). That agent has this repo's actual trust boundaries baked in (deployed bundle ↔ browser, repo ↔ git history, CI ↔ Pages, Claude tooling ↔ repo).

The **cookie-consent**, **third-party-data-flows**, **gdpr**, **data-export-completeness**, **account-deletion-completeness**, and **accessibility** commands delegate to the `compliance-auditor` agent — it knows the legal-page commitments and the `docs/legal-status.md` tracker.

The **infra** and **cost-controls** commands are no-ops and respond inline.

`/audit/all` spawns one agent per wired area in parallel.

## Diff-time enforcement (complementary)

For per-PR enforcement (as opposed to periodic broad sweeps), use:

- [/check](../check.md) — pre-commit gate: `code-reviewer` + `test-gap-checker` + `doc-hygiene-checker` in parallel against the working diff.
- [/safe-edit](../safe-edit.md) — coder ↔ reviewer loop for non-trivial changes (~2-3x cost; use for legal-page edits and anything that touches the deploy workflow).
- [/release-readiness](../release-readiness.md) — pre-tag gate before publishing a release.

These are for per-PR / pre-deploy enforcement; the audit commands here are for periodic broad sweeps.

## When to run

- **Before a Stripe risk-review request** — `/audit/all`. The site is the business URL; fix Critical / High before re-submitting.
- **After adding any third-party script / font / pixel / iframe to a template** — `/audit/cookie-consent` + `/audit/third-party-data-flows` (and update `content/privacy.md` §4 in the same change).
- **After editing `.github/workflows/`** — `/audit/secrets` (catches new secret references) + `/audit/deps` (catches new un-pinned action refs).
- **Periodically (quarterly while pre-launch, per `docs/legal-status.md`)** — `/audit/all` to catch slow-moving drift.

## What's intentionally not here

The donor-project audits for IaC (Terraform IAM least-privilege, OIDC subject conditions, KMS rotation, CloudFront security headers, Lambda permissions) and metered-SaaS cost controls (AWS budget alarms, `<email-service>` quota headroom, `<CMS>` dataset growth, per-IP rate-limits) are intentionally absent here because this stack doesn't have any of that. If this repo ever grows a backend or moves off GitHub Pages, those audits become real — look at the previous template revisions in `git log` for prior shape.
