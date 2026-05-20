# .claude/ — Claude Code tooling

Slash commands and agents tuned for this repo — a Zola personal website at
[jaredhoward.com](https://jaredhoward.com), deployed to GitHub Pages, that
also serves as the public business URL for Stripe sign-up.

The point of having `.claude/` files in the tree (rather than relying on
ad-hoc instructions per session) is that the discipline the legal pages
require — see `docs/legal-status.md` — is the kind of thing a code-only
reviewer would miss. Each agent here knows the trust boundaries and the
non-obvious load-bearing rules.

## What's here

### Agents (`agents/`)

- **`code-reviewer.md`** — read-only diff review against the rules
  encoded in `CLAUDE.md` and `docs/legal-status.md`. Invoked from
  `/check` and `/safe-edit`.
- **`doc-hygiene-checker.md`** — flags when a non-trivial code change
  hasn't been paired with a doc update.
- **`test-gap-checker.md`** — there is no test framework here, so this
  agent is mostly a guard against regressions in the legal-page
  cross-references and the few bits of client JS in `static/js/`.
- **`ui-polisher.md`** — typography / layout polish targeted at Zola
  templates and Markdown content.
- **`repo-security-auditor.md`** — invoked by the `/audit/*` commands.
  Knows that this site has no backend, no secrets, no PII, no auth — so
  the real audit surface is "what could leak into the deployed bundle"
  and "is the deployed bundle still consistent with the privacy policy?"
- **`compliance-auditor.md`** — invoked by the legal-flavoured audit
  commands. Knows the legal-page commitments in `content/` plus the
  `docs/legal-status.md` tracker, and audits the *deployed surface*
  against them — not a hypothetical SaaS backend.

### Commands (`commands/`)

- **`check.md`** — run code-reviewer + test-gap-checker + doc-hygiene
  against the working diff.
- **`safe-edit.md`** — fix-and-review loop for load-bearing changes
  (legal pages, deploy workflow, CSP-shaped HTML).
- **`polish-ui.md`** — typography / layout polish on a template or page.
- **`release-readiness.md`** — go/no-go checklist before tagging a
  release (here, tags map to deploys via `deploy.yml`).
- **`audit/`** — focused security and compliance sweeps:
  - `secrets.md`, `xss.md`, `deps.md` — generic supply-chain hygiene
  - `cookie-consent.md`, `third-party-data-flows.md` — the privacy-
    policy commitment ("first-party only") is enforceable, and these
    audits keep the deployed bundle honest against it
  - `accessibility.md` — WCAG / EAA pass on the deployed surface
  - `gdpr.md`, `data-export-completeness.md`,
    `account-deletion-completeness.md` — currently scoped to "this
    site has no accounts and processes no PII; the policy says so;
    confirm the deployed surface matches". They become real audits if
    the site ever gains a backend
  - `cost-controls.md`, `infra.md` — kept as no-op stubs that simply
    state "N/A — GitHub Pages, no AWS, no Lambda". Useful if any of
    that ever changes
  - `all.md` runs every wired area
  - `README.md` is the index

## Conventions worth knowing before editing these

- The agents and commands are tuned for *this site*. If they start
  emitting findings about Svelte / Hono / SOPS / Lambda / Sanity / a
  backend route table — that's drift, not a real finding. Re-read the
  agent and strip the stale guidance.
- Legal-page changes are special — they go through `docs/legal-status.md`
  before merging. Several agents reference that file by name.
- This site is intentionally first-party only and tracker-free. If an
  audit ever surfaces a new third-party network call, that's a finding
  regardless of how innocuous the destination looks.
