---
description: Posture confirmation — this site has no accounts and stores no PII, so there is nothing to export. Expected finding state is "still nothing to export".
---

Audit data-export completeness for this site.

## Goal

GDPR Art 20 (portability) and CCPA right-to-know require a complete, machine-readable export of all personal data a service holds about the user. This site holds none — there is no account system, no database, no contact-form POST endpoint, no comment / kudos / feedback system. The Contact page is a `mailto:` link; once a visitor sends an email, the operator's Gmail inbox holds it, but that's outside this codebase and falls under Google's own DSAR process (which the operator surfaces to in `content/privacy.md` §11).

Under that posture, there is no exporter to audit. The audit confirms that posture still holds — that no surface in this repo has quietly grown into something that processes or stores personal data.

## What to check

1. **Privacy policy still states "no exporter".** Read `content/privacy.md` sections covering data subject rights. Confirm the policy still says (in substance):
   - The site does not store personal data on the operator's systems.
   - Statutory rights (access, deletion, correction, etc.) are exercised by contacting the operator at the address in §11.
   - There is no automated export endpoint because there is nothing to export from this site.

   If the policy now promises an export endpoint that doesn't exist, that's a Critical — the policy commits to something product won't deliver.

2. **No data-collection endpoints have crept in.** This means:
   - No backend code in this repo (still no `package.json`, no Lambda, no Worker, no server-side rendering).
   - No third-party form-handler (Formspree, Tally, Typeform, Netlify Forms) in `templates/` or `content/`. Grep for `action="https`, `data-netlify`, `formspree.io`, `tally.so`, `typeform.com`.
   - No analytics / session-recording / CRM that would accumulate visitor data over time (out of scope of this audit, but mention).

3. **No localStorage / sessionStorage / cookie writes** that would constitute "data we hold about the user". Walk `static/js/`. None should write any identifier.

4. **`docs/legal-status.md` tracker still reflects "no exporter needed".** Confirm the tracker hasn't been edited toward a "we promised an export" state without a matching policy or product change.

## Expected finding state

For this repo, the expected state is **clean — nothing to export, and the policy still says so**. A non-empty result means either the policy now promises something the product doesn't deliver, or a data-collection surface has quietly landed.

## Report

- **Critical** — the policy now promises an export endpoint but no exporter exists; or a data-collection endpoint exists but the policy is silent.
- **High** — a form-handler / analytics tool now collects visitor data that would have to be exportable.
- **Medium** — `docs/legal-status.md` says "launch gate" items are still open even though the policy claims they're done.
- **Low** — undocumented intent on a borderline data point (e.g. a hidden `localStorage` key set by client JS).

End with a **clean** section: the surfaces walked and confirmed still inert.

## Delegate to

Use the `compliance-auditor` agent: `"Audit data-export completeness for this static site. The expected state is 'nothing to export' — surface anything that contradicts that."`

Read-only. Findings only.

## When this command becomes real

If this repo ever grows a backend or starts collecting visitor data through any channel handled in-tree, this command needs a real body. The previous template revision had an extensive completeness audit (column-by-column coverage, Storage prefix walk, third-party-linked state, JSON/CSV format requirements) — look at the donor-project history in `git log` for prior shape.
