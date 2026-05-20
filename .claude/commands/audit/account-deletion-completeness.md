---
description: Posture confirmation — this site has no accounts, so there is nothing to delete. Expected finding state is "still no accounts to delete".
---

Audit the account-deletion path for completeness.

## Goal

GDPR Art 17 (right to erasure) requires a service to delete personal data on request. Apple and Google both *mandate* an in-app account-deletion route for any app that supports account creation. This site supports no account creation — there is no signup, no login, no profile, no `auth.users` table because there is no auth.

The legal pages reflect this:

- `content/terms.md` §4.4 commits to a future in-product cancellation control once a paid subscription product ships.
- `content/refunds.md` §1 commits to the same.
- `docs/legal-status.md` "Launch gates" lists both as hard blockers before the first paying subscriber.

Under that posture, there is no `delete-account` handler to audit. The audit confirms that posture still holds — that no surface in this repo has quietly grown an account system or a user-state store.

## What to check

1. **No account system exists yet.**
   - No backend code (the root `package.json` is a script-only pnpm wrapper around the `zola` CLI; no Lambda, no Worker, no server-side rendering).
   - No third-party auth (Auth0 / Clerk / Supabase Auth / Firebase Auth) loaded in any template.
   - No newsletter / subscription form (Substack widget, ConvertKit form, Mailchimp embed) that would create an addressable user record.

2. **Privacy policy still reflects "no accounts".** Read `content/privacy.md`. Confirm it does not promise a delete-account UI that doesn't exist. If it now claims "delete your account from Settings", that's a Critical — the policy promises what the product doesn't have.

3. **Launch gates still flagged in `docs/legal-status.md`.** The tracker should still list:
   - "In-product cancellation control" as not yet built.
   - "Pre-charge auto-renewal disclosure UX" as not yet built.
   - "Automated annual-renewal reminder email" as not yet built.
   - "Plan-specific refund documentation" as not yet built.

   If any of these have been ticked off without the corresponding product surface landing in this repo, that's a finding — the tracker drifted ahead of reality.

4. **No identifier writes in client JS.** Walk `static/js/`. Confirm no `localStorage` / `sessionStorage` / cookie set creates a stable identifier the operator would have to delete on request.

## Expected finding state

For this repo, the expected state is **clean — no accounts, no exporter, no deletion endpoint needed**. A non-empty result means either the policy now promises something the product doesn't deliver, or an account-shaped surface has quietly landed.

## Report

- **Critical** — the policy now promises an in-product cancellation / account-deletion UI but no such surface exists; or an account surface exists but the policy is silent.
- **High** — `docs/legal-status.md` has been edited to claim a launch gate is met when the in-tree product doesn't support it.
- **Medium** — third-party widget loaded that creates an addressable record but no deletion path is documented.
- **Low** — undocumented intent on a borderline data point (e.g. a `localStorage` key that arguably constitutes account state).

End with a **clean** section: "no accounts", "no auth", "no delete-account handler needed", "launch-gate status in `docs/legal-status.md`: still open per tracker".

## Delegate to

Use the `compliance-auditor` agent: `"Audit the account-deletion posture for this static site. The expected state is 'no accounts' — surface anything that contradicts that."`

Read-only. Findings only.

## When this command becomes real

If this repo ever grows an account system, an auth flow, or any addressable user record, this command needs a real body. The previous template revision had an extensive completeness audit (FK cascade coverage, Storage prefix walk, third-party revocation, deletion order, audit log) — look at the donor-project history in `git log` for prior shape.
