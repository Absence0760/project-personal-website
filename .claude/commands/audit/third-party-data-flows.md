---
description: Map every outbound network touch the deployed bundle makes. Expected output is an empty (or near-empty) sub-processor list.
---

Audit every outbound network flow the deployed bundle makes. Output is the sub-processor list to paste into `content/privacy.md` §4.

## Goal

`content/privacy.md` §4 names Stripe (as the operator's payment processor at the business level), GitHub (as the platform hosting the site), and Google (as the email provider). It explicitly excludes third-party analytics, fonts, CDNs, chat widgets, and the like. The audit's job is to confirm the deployed bundle does not contradict that list — and to give the operator a regenerated sub-processor table if it does (so they can update the policy in the same change).

For a truly first-party static site, the table this command produces should be **empty or contain only same-origin / GitHub-Pages CDN entries**.

## What to check

1. **Templates.** Walk every file in `templates/`. Inventory every `src=`, `href=`, `url(...)` reference. Same-origin URLs (`{{ get_url(...) | safe }}`, relative paths) are fine. Any `https://` / `http://` / `//` URL pointing elsewhere is a sub-processor entry.

2. **Stylesheet.** Read `static/css/style.css`. Inventory every `@import`, `url(...)`, `src:`. Same-origin → fine. External → sub-processor entry.

3. **Client JS.** Walk `static/js/`. Inventory every `fetch()`, `XMLHttpRequest`, `new Image()`, dynamic `import()`, `document.createElement('script')` with `src` assignment. All current uses (in `transitions.js`, `infinite-scroll.js`) are same-origin `fetch()`s of the same Zola build. Confirm.

4. **Markdown content.** Walk every file in `content/`. Markdown permits raw HTML; surface any `<script src=`, `<link rel="stylesheet" href=`, `<iframe>`, `<embed>`, `<img src=` that points off-origin.

5. **CV PDF.** `static/cv.pdf` is a binary; out of scope for this static-audit pass. Flag as a manual-review item.

6. **GitHub Pages itself.** GitHub serves the bundle. GitHub's own logs (request IP, user-agent, referrer) are kept by GitHub on the operator's behalf. This belongs in the sub-processor list as "GitHub Pages (hosting + access logs)" — confirm `content/privacy.md` §4 still names it.

## Report

Output two artefacts:

### (A) Sub-processor table

| Provider | Data carried | Region | Purpose | Policy cite | Currently disclosed in `content/privacy.md` §4? |
|---|---|---|---|---|---|

One row per outbound flow you found. For a clean repo this table has one or two rows (GitHub Pages, possibly Stripe if any Stripe.js gets added — but currently no Stripe.js is loaded here).

### (B) Findings

- **Critical** — a sub-processor that is *not* currently disclosed anywhere in `content/privacy.md` §4 (or that's disclosed but with materially wrong language).
- **High** — a sub-processor that's disclosed for one purpose but actually receives data for a different purpose.
- **Medium** — missing region detail or unclear data-retention statement for a disclosed sub-processor.
- **Low** — sub-sub-processor chain that the policy could point to (e.g. "GitHub uses sub-processors of its own — see github.com/site/privacy").

End with a **clean** section listing the surfaces you walked where you confirmed no outbound personal-data flow happens.

## Delegate to

Use the `compliance-auditor` agent: `"Map every outbound network touch this static site's deployed bundle makes into a sub-processor table. Cross-check against content/privacy.md §4."`

Read-only. Output the table + findings.
