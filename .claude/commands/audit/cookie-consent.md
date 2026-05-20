---
description: Verify the site sets no cookies and loads no third-party scripts. Expected finding state is empty.
---

Audit the site's cookie + script consent posture. **Expected finding state: empty.**

## Goal

`content/privacy.md` §4 and §8 commit this site to being first-party only — no third-party analytics, no embedded scripts, no consent banner because there is nothing requiring consent. ePrivacy Directive Art 5(3) + GDPR require a consent banner *only* if non-essential cookies or third-party scripts actually fire. Since none do, no banner is needed.

The audit's job is to verify that posture still holds. If a third-party script ever ships, the posture is broken and *either* the script comes out *or* the policy + consent UX has to land — in the same change.

## What to check

1. **Templates.** Walk every file in `templates/`. Grep each for:
   - `<script src=` — any external script source is a finding.
   - `<link rel="stylesheet" href="http` (or `//`) — any external stylesheet is a finding.
   - `<iframe`, `<embed`, `<object` — any embedded third-party content is a finding.
   - `<img src="http` (where the host isn't `jaredhoward.com`) — externally-hosted images are a finding (they hand the visitor's IP to a third party).
   - Web-font `@font-face` rules with external `src:` URLs.

2. **Markdown content.** Walk every file in `content/`. Same greps as step 1 — raw HTML is permitted inside Markdown by default, so an external `<script>` or `<iframe>` can sneak in via a `notes/*.md` post.

3. **Stylesheet.** Read `static/css/style.css`. Grep for:
   - `@import url(http` — external font / CSS import.
   - `background-image: url(http` — externally-hosted image.
   - `src: url(http` in any `@font-face` rule.

4. **Client JS.** Walk `static/js/`. Grep each file for:
   - `fetch(` with a non-relative URL (anything starting with `http://`, `https://`, or `//`).
   - `XMLHttpRequest` with a non-relative URL.
   - `new Image()` / `img.src =` with a non-relative URL.
   - `import(` (dynamic import) with a remote URL.
   - `document.createElement('script')` followed by setting `src` to a remote URL.

5. **Cookies.** This site sets none on the client side. Confirm there is no `document.cookie =` write anywhere in `static/js/`. (GitHub Pages does not set any first-party cookie on its own.)

6. **`localStorage` / `sessionStorage` / `indexedDB`.** None of these are tracking by themselves, but if `static/js/*` starts writing to them, surface as a Note — the policy says "we collect nothing", and a stored identifier would soften that claim.

## Expected finding state

For this repo, the expected state is **clean — zero findings**. A non-empty result is the load-bearing signal: the policy claim in `content/privacy.md` §4 + §8 is now wrong, and either the bundle or the policy has to move.

## Report

- **Critical** — any third-party script / iframe / pixel / font / fetch fires on a deployed page. The policy is contradicted; surface immediately and recommend either removal or a policy + consent-UX update in the same change.
- **High** — `localStorage`/`sessionStorage`/`indexedDB` writes that store an identifier; cookie set client-side.
- **Medium** — an externally-hosted asset that's "probably essential" (e.g. a CV image hosted on a personal CDN) — defensible but not currently disclosed in the policy.
- **Low** — a comment or dead code that references a third-party load even if it never runs.

For each: the file:line that triggers the load, what data it carries, and the policy section it contradicts (`content/privacy.md` §4 or §8).

End with a **clean** section listing the surfaces you walked and found nothing on — explicitly: "templates/: clean", "static/js/: clean", "static/css/: clean", "content/: clean".

## Delegate to

Use the `compliance-auditor` agent: `"Audit the site's cookie + third-party-script posture. The expected finding state is empty; surface anything that fires."`

Read-only. Findings only.
