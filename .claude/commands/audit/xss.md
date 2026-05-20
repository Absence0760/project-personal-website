---
description: Audit content and template rendering paths for XSS — Tera `| safe` filter usage, client JS that interpolates URL state, raw HTML in Markdown content
---

Find every place the deployed bundle renders dynamic input as HTML, and verify it's either escaped (Tera's default) or sanitised.

## Goal

This is a Zola static site. Most strings are rendered as text via `{{ value }}` — safe by default (Tera HTML-escapes). The risk surfaces are:

1. Anywhere `| safe` is applied to a value that isn't strictly trusted at build time.
2. Anywhere client JS in `static/js/` interpolates URL state (query params, hash fragments, history) into the DOM.
3. Anywhere Markdown content embeds raw HTML.

There is no CMS, no rich-text serialiser, no user-content submission system, no server-rendered email. The surface is small but the build inlines everything, so an oversight ships.

## What to check

1. **Tera `| safe` filter.**
   - Grep `templates/` for `| safe`. For every hit, confirm the value being marked safe is build-time-trusted:
     - Hard-coded URL paths (from `get_url(path=...)`) — fine.
     - `current_url`, `canonical` — fine, set by Zola itself.
     - Anything coming from a Markdown front-matter field — needs justification; front-matter content is operator-controlled so usually fine, but flag for review.
   - The current uses in `templates/base.html` are all `get_url(...)` / `current_url` (URL outputs that Zola guarantees safe). If a new `| safe` lands on a user-supplied or page-content field, that's a Medium-or-higher finding.

2. **Markdown raw HTML.**
   - Zola permits raw HTML in Markdown by default. Grep `content/**/*.md` for `<script`, `<iframe`, `<object`, `<embed`, `<style`. Any hit is at minimum a Medium — the legal pages should be pure prose; raw script tags suggest tracker drift.
   - The CV section and other long-form content may legitimately use `<dl>` / `<details>` HTML — those are fine. The concern is script / iframe / embed.

3. **Client JS DOM injection.**
   - `static/js/transitions.js` swaps `<main>` content from a `fetch()`'d HTML response. Trace: the source is the same-origin Zola build, no user input, so the swap is safe by construction. **But** confirm the URL handling code never uses `window.location.hash` / `search` to construct an element ID or selector without escaping — that's the typical XSS sink in same-origin SPA-like transitions.
   - `static/js/tag-filter.js` reads `data-tag` attributes and selects elements. Confirm `data-tag` values come from Zola's templating (operator-controlled at build time), not from URL state.
   - `static/js/infinite-scroll.js` fetches next-page HTML and appends nodes. Same logic as `transitions.js` — confirm URL handling doesn't accept attacker-controlled IDs.

4. **Dynamic `href` / `src` in templates.**
   - Grep `templates/` for `href="{{` and `src="{{`. For each, confirm the interpolated value can't be a `javascript:` or `data:` scheme. Page permalinks from `page.permalink` are Zola-generated; fine. External URLs from front-matter would be a finding if they exist.

5. **Inline event handlers and `style="..."` attributes.**
   - Grep `templates/` and `content/` for `onclick=`, `onerror=`, `onload=`. Any hit is at least Medium.
   - Inline `style="..."` is not XSS per se but is a code-smell — surface as Low.

## Expected finding state

For this repo, the expected state is **at most a small number of Notes** (e.g. "all `| safe` uses are `get_url` outputs — fine"). A High / Critical finding indicates real XSS surface.

## Report

- **High** — operator/user-controllable string reaches the DOM as HTML without sanitisation, or as a `href`/`src` value that could be `javascript:`.
- **Medium** — raw `<script>` / `<iframe>` in a Markdown file (also a privacy-policy finding — see `/audit/cookie-consent`); a `| safe` on a value whose provenance is unclear.
- **Low** — inline event handlers, `style="..."`, or other code-smell that isn't immediately exploitable but makes future XSS easy to introduce.

For each: file:line, the source of the dynamic value, the rendering site, the missing escape / sanitiser.

## Useful starting points

- `templates/base.html` — the shared layout; `{{ ... | safe }}` calls live here
- `templates/index.html`, `templates/section.html`, `templates/page.html`, `templates/cv/section.html`, `templates/taxonomy_*.html` — render content fields
- `static/js/transitions.js`, `static/js/tag-filter.js`, `static/js/infinite-scroll.js` — client-side DOM mutation
- `content/**/*.md` — pure-prose Markdown; any raw HTML beyond `<dl>` / `<details>` / structural elements is suspicious

## Delegate to

Use the `repo-security-auditor` agent: `"Audit content and template rendering paths for XSS — Tera | safe filter usage, raw HTML in Markdown, client JS that interpolates URL state."`

Read-only. Report findings; don't patch without confirmation.
