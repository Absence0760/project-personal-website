---
description: Confirm the site's posture remains US-targeted, tracker-free, and PII-free — the conditions under which GDPR exposure stays minimal
---

Audit the GDPR / UK GDPR posture of this site.

## Goal

This site is a Zola static site at `jaredhoward.com` deployed to GitHub Pages. It has no backend, no accounts, no PII storage, and no marketing targeted at the EU / UK. Per `content/privacy.md` §1 and `content/terms.md` §12, the operator's stated jurisdiction and customer base are US-only.

Under that posture, GDPR exposure is minimal: no controllership over EU personal data, no Art 27 EU representative requirement, no consent banner needed (no cookies, no third-party scripts), no DSAR endpoints (nothing to export or delete). The audit's job is to confirm the posture still holds — not to manufacture compliance debt where there is none.

If the operator ever starts marketing to EU customers, this audit becomes a much bigger lift (lawful basis per data class, DPA, transfer mechanism, age gate, breach plan, DPIA for any high-risk processing). Track that change-of-intent in `docs/legal-status.md "International / non-US user posture"`.

## What to check

1. **US-only posture is still stated.** Read `content/privacy.md` §1 and `content/terms.md` §12. Confirm both still say US-targeted, US governing law, US dispute resolution. If either has softened toward "global" / "EU welcome" without `docs/legal-status.md` flagging the change, surface as Critical — the posture-of-record changed without the policy catching up.

2. **No third-party scripts / fonts / pixels / iframes.** Run a deployed-bundle sweep equivalent to `/audit/cookie-consent`: grep every `templates/*.html`, every file under `static/`, and every Markdown file in `content/` for `<script src=`, `<link rel="stylesheet" href="http`, `<iframe`, `@import url(http`, `<img src="http` (where `http` includes `https`). If everything resolves to same-origin or to the Zola-generated relative URL, posture holds. Any external host is at minimum a High and forces a `content/privacy.md` §4 update.

3. **No tracker-shaped client JS.** Walk `static/js/`. The current set (`transitions.js`, `tag-filter.js`, `infinite-scroll.js`) is first-party DOM behaviour with no analytics calls. Any new file or any new `fetch()` to a non-same-origin URL is a finding.

4. **No analytics commitments to renege on.** Confirm `content/privacy.md` §8 ("We do not currently use third-party analytics...") matches reality. If the policy says "no third-party analytics" and the bundle ships an analytics call, that's the cross-validation failure this audit exists to catch.

5. **No PII collection surfaces.** Confirm `content/contact.md` still uses a `mailto:` link (or equivalent) rather than a POST endpoint to a third-party form-handler. A "Formspree-shaped" handler would route visitor email + body to a sub-processor — would need policy update.

6. **`docs/legal-status.md` tracker still says US-only.** Read its "Forward-looking notes" → "International / non-US user posture" section. If the tracker says "still US-only" and the bundle / policy still says so, posture is consistent. If the tracker has been edited toward EU intent without the policy catching up, surface as Critical.

## Expected finding state

For this repo, the expected state is **clean** — every step above resolves to the same first-party / US-only / PII-free posture stated in the policy. A non-empty result is the load-bearing signal.

## Report

- **Critical** — the bundle contradicts a statement in `content/privacy.md` (tracker added, third-party fetch landed, etc.).
- **High** — the policy has been softened to imply EU intent or PII collection without the supporting product/UX work, OR the bundle has a network touch the policy doesn't disclose.
- **Medium** — `docs/legal-status.md` tracker is silent on a change the policy reflects.
- **Low** — undocumented intent on a borderline asset (e.g. a self-hosted but third-party-attributed image).

For each: regime cite (CCPA / VCDPA / GDPR Art X if EU intent emerges) + concrete fix scope (file or "policy doc + product change"). Always end legal-claim bullets with "ask counsel if unsure" — this is not legal advice.

End with a **clean** list of GDPR areas that look fine — explicitly call out "EU targeting: not present", "PII collection: none", "third-party scripts: none" if each is true.

## Delegate to

Use the `compliance-auditor` agent: `"Audit the GDPR posture of this US-targeted static site. The expected finding state is clean; surface anything that contradicts the posture statements in content/privacy.md and content/terms.md."`

Read-only. Findings only. Always end legal claims with "ask counsel if unsure".
