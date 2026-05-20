---
description: Implement a non-trivial change with a code-reviewer agent loop — coder → review → fix → review → ready-to-commit. Costs ~2-3x a normal edit; use when the change warrants the extra rigor.
argument-hint: <task description>
---

Implement the task `$ARGUMENTS` with the project-specific `code-reviewer` agent in the loop.

## When to use this command

**Right fit:**

- Edits to the four legal pages — `content/terms.md`, `content/privacy.md`, `content/refunds.md`, `content/contact.md` — or to `docs/legal-status.md`. These pages are pre-counsel-reviewed and have cross-reference invariants that a casual edit can break.
- Changes that add, remove, or alter a third-party network call — even something as innocuous as an embedded video or a hosted font. These break the first-party commitment in `content/privacy.md` §4 and §8 and need explicit policy edits in the same diff.
- Changes to `templates/base.html` (every page renders through it) or to the homepage services section in `templates/index.html` (it has to stay aligned with Terms §1).
- Changes to `static/CNAME`, `base_url` in `config.toml`, or the Zola version pinned in `.github/workflows/ci.yml` / `deploy.yml`.
- CI workflow changes — anything under `.github/workflows/` that touches `id-token`, `pull_request_target`, or the Claude Code allowlist.
- Anything you want a second pair of eyes on before commit.

**Wrong fit — refuse and tell the user to edit directly:**

- Typos and one-line doc corrections.
- Comment edits in JS / templates.
- Single-property CSS tweaks in `static/css/style.css`.
- Dependency-version bumps (Dependabot Action PRs).
- New entries in a `content/notes/` post or other non-legal content.
- Anything where the diff is < ~10 lines and touches no project invariant listed above.

The cost of this loop is real (~2-3x tokens, ~30-60s extra latency, one or two `code-reviewer` agent runs). Don't burn it on changes that don't warrant it. **If the task is trivial, abort and tell the user to just edit it normally.**

## The loop

1. **Coder pass.** Implement the task as you normally would. Use TaskCreate to track multi-step work. Do NOT commit yet.

2. **Round 1 review.** Spawn the `code-reviewer` agent with the prompt:
   > "Review the working diff against this project's documented conventions. The task being implemented is: `$ARGUMENTS`. Output the strict format from your spec."

   The reviewer reads `git diff`, cross-references project rules, and outputs:
   - `Status: CLEAN` → go to step 5.
   - `Status: NEEDS_CHANGES` with a numbered list of concrete file:line changes → go to step 3.

3. **Apply fixes.** Read the reviewer's findings. For each Critical / Improvement item:
   - If the finding is correct, apply the suggested change.
   - If the finding is wrong (the reviewer misread, missed context, or cited a rule that doesn't apply here), state explicitly *why* you're not applying it. Do NOT silently skip — the user needs to see the disagreement.
   - If the finding is borderline, apply it; the reviewer is configured to be willing to retract on the next round, so over-applying is safe.

4. **Round 2 review.** Spawn `code-reviewer` again with the same prompt. Three branches:
   - `Status: CLEAN` → go to step 5.
   - `Status: NEEDS_CHANGES` again → **stop the loop**. Surface the remaining findings to the user along with what you tried in Round 1. Do not auto-cycle to Round 3 — at this point either the reviewer is being pedantic, the coder is missing something, or the change needs more thought than a tight loop can give. The user decides.
   - Reviewer retracts Round 1 findings → also `CLEAN`; go to step 5.

5. **Ready-to-commit handoff.** Tell the user:
   - What was changed (one-line summary, not a recap of the diff).
   - Which review round produced the clean status.
   - Any Notes or Out-of-scope observations the reviewer surfaced (worth knowing, not blocking).
   - Ask whether to commit. **Never commit without being asked** (project rule from `CLAUDE.md`).

6. **On user "yes":** stage the changed files explicitly (don't `git add -A` — could pick up scratch output from `zola build`), draft a commit message that follows the project's style (conventional-commit prefix per the recent `git log`, no `Co-Authored-By`, no Claude footer), commit, report success.

## Loop-termination guarantees

- Hard cap: 2 review cycles. Round 3 is forbidden.
- The reviewer cannot trigger a re-cycle with abstract concerns alone — its spec requires concrete numbered file:line diff changes for `NEEDS_CHANGES`. If it tries to cycle on vague "consider X" findings, treat as `CLEAN` and surface the comments to the user.
- The reviewer's `Out-of-scope observations` are informational only and never trigger a cycle, no matter how many.
- If the coder disagrees with a Round 1 finding and doesn't apply it, that disagreement must be visible in the Round 2 prompt context — quote the disagreement so the reviewer can re-evaluate.

## What this command does NOT replace

- `/check` is the lighter pre-commit gate — review + test-gap + doc-hygiene, single pass, advisory. Use it for everyday changes that don't warrant `/safe-edit`'s 2-3x cost. The two are complementary.
- `zola build` still runs when you'd normally run it. The reviewer is on top of it, not instead.
- `/audit/*` is still the right tool for periodic broad sweeps. `/safe-edit` is per-change.

## Tone

Don't narrate the loop step-by-step in user-facing text. The user sees:
- Your normal coder updates (one sentence per significant step).
- A short "Round 1 review found N findings: [list]; applied them" or "Round 1 review came back clean."
- A short "Round 2 review came back clean — ready to commit. Want me to?" handoff.
- Or, if the loop terminates without consensus: a clear summary of what's still contested and a request for the user's call.
