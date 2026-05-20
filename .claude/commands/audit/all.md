---
description: Run the full audit sweep — secrets + xss + deps + cookie-consent + third-party-data-flows + accessibility — in parallel
argument-hint: [security|deps|compliance] (optional area filter)
---

Run the project's audit sweep. By default, runs every wired audit; with an argument, runs the named subset.

## Areas

- **security** — `audit/secrets`, `audit/xss`
- **deps** — `audit/deps`
- **compliance** — `audit/cookie-consent`, `audit/third-party-data-flows`, `audit/gdpr`, `audit/data-export-completeness`, `audit/account-deletion-completeness`, `audit/accessibility`

`audit/infra` and `audit/cost-controls` are intentional no-ops for this stack and are not run.

## Procedure

1. Decide which audits to run based on `$ARGUMENTS`:
   - No argument → all wired audits in security + deps + compliance
   - `security` → `secrets` + `xss`
   - `deps` → `deps` only
   - `compliance` → `cookie-consent` + `third-party-data-flows` + `gdpr` + `data-export-completeness` + `account-deletion-completeness` + `accessibility`
2. **Spawn the right agent per audit area, in parallel.** Send all dispatches in a single message with multiple Agent tool calls.
   - `secrets`, `xss`, `deps`: each is a separate `repo-security-auditor` invocation, with the audit area passed as the prompt's first sentence. The agent already has this repo's trust boundaries baked in; the prompt just steers it.
   - `cookie-consent`, `third-party-data-flows`, `gdpr`, `data-export-completeness`, `account-deletion-completeness`, `accessibility`: each is a separate `compliance-auditor` invocation, same pattern.
3. **Consolidate findings** into a single report grouped by severity (Critical / High / Medium / Low), then by audit area. For each finding: file:line, what's wrong, the audit that found it.
4. **Recommend a fix order**, but don't apply fixes without explicit confirmation. Critical/High findings should be flagged with "fix this before next deploy"; Medium/Low can be batched.

## Output shape

```
# Audit report — <date>

## Critical (N)
- [audit/<area>] file:line — <one-line>
- ...

## High (N)
- ...

## Medium (N)
- ...

## Low (N)
- ...

## Clean (no findings)
- [audit/<area>] no issues

## Recommended order
1. ...
2. ...
```

## Notes

- This is read-only. Each sub-audit is read-only by default.
- The report is the deliverable; do not edit code based on findings without asking the user first.
- If an audit finds no issues, list it under the `## Clean` section — easier to spot regression on the next run.
- The "happy path" finding state for `cookie-consent` and `third-party-data-flows` on this site is **empty**. A non-empty result is the load-bearing signal — surface it prominently.
