# Contributing

Thanks for considering a contribution. This file describes how to work in this repo.

## Before you start

- Open an issue (or comment on an existing one) describing what you want to change. For non-trivial changes, get rough agreement on the approach before opening a PR — it's easier to redirect a sentence than a 500-line diff.
- Look at recent commits in the area you're touching for style cues.
- Local dev quick reference lives in `docs/run-locally.md`; the rest of the stack lives in `CLAUDE.md`.

## Branching

Work on a feature branch off `main`:

```
git checkout -b feat/<short-slug>      # for features
git checkout -b fix/<short-slug>       # for bug fixes
git checkout -b chore/<short-slug>     # for tooling / housekeeping
git checkout -b docs/<short-slug>      # for docs only
```

Keep branches short-lived. If you're working on something that'll take more than a couple of days, rebase onto `main` regularly to avoid drift.

## Commits

Use conventional-commit-style messages:

```
feat(scope): add the thing
fix(scope): stop the crash on Y
chore(scope): bump dependency Z
docs(scope): clarify the setup steps for X
```

Scope is the area you're touching (e.g. `templates`, `content`, `static`, `ci`, `docs`, `legal`, etc.). Keep the subject line under 70 characters; put rationale in the body if the change isn't self-evident.

## Docs are part of the change

Per the rule in `CLAUDE.md`: every PR that touches non-trivial code also updates the relevant doc in the same diff. There is no test framework here (no `package.json`, no vitest, no Playwright); the discipline reduces to keeping `docs/` and — for changes that touch legal pages — `docs/legal-status.md` honest.

## Running the checks locally

```
zola build                 # builds into ./public, fails on broken templates / dead links
zola serve                 # local dev server with live reload
pre-commit run --all-files # gitleaks + the other hygiene hooks
```

If Claude Code is available, `/check` runs the diff-review / doc-hygiene / test-gap agents in parallel and reports — see `.claude/commands/check.md`.

## Opening a PR

- Title: same conventional-commit format as commits.
- Description: fill in the `pull_request_template.md`. The "Static-site safety checklist" is there for a reason — even ticking the boxes is a useful prompt to think through each item (especially the privacy-policy and legal-page rows).
- Mark as **Draft** while CI is still running; flip to ready when checks are green.
- Don't squash on merge unless you're cleaning up a noisy WIP series — preserving meaningful commits in `main` makes `git blame` more useful.

## Reviewing a PR

- Pull the branch locally, run `zola build` (and `zola serve` if the change is visible), and click through the affected pages.
- `/check` (or `/safe-edit` for security- or legal-page-adjacent changes) invokes the `code-reviewer` agent for a first-pass review. Use it as a starting point, not a substitute for human eyes.

## Security findings

If you discover a vulnerability, **do not** open a public issue or PR. Email the maintainer directly — `SECURITY.md` has the contact and the response SLA.
