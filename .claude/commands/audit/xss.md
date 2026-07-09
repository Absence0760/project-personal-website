---
description: Audit component and rendering paths for XSS — Svelte `{@html}` usage, client code that interpolates URL state, raw HTML embedded in components
---

Find every place the deployed bundle renders dynamic input as HTML, and verify it's either escaped (Svelte's default) or sanitised.

## Goal

This is a SvelteKit static site. Most strings are rendered as text via `{value}` — safe by default (Svelte HTML-escapes text bindings). The risk surfaces are:

1. Anywhere `{@html …}` is applied to a value that isn't strictly trusted at build time.
2. Anywhere client code in a component or `src/lib/` interpolates URL state (query params, hash fragments, history) into the DOM.
3. Anywhere a component embeds a large literal HTML block (the legal pages, the `<dl class="capability-data">` block).

There is no CMS, no rich-text serialiser, no user-content submission system, no server-rendered email. The surface is small but prerendering bakes everything into static HTML, so an oversight ships.

## What to check

1. **Svelte `{@html}` blocks.**
   - Grep `src/` for `{@html`. For every hit, confirm the value being rendered as HTML is build-time-trusted:
     - Hard-coded / author-written markup strings — fine.
     - Values derived from `src/lib/site.ts` (title, canonical URL) — fine, author-controlled at build time.
     - Anything coming from a runtime value (URL, query state, props threaded from a loader) — needs justification; flag for review.
   - If the current pages use `{@html}` at all, confirm each wraps author-written static content. A new `{@html}` on a user-supplied or runtime value is a Medium-or-higher finding.

2. **Embedded raw HTML in components.**
   - Pages are hand-written Svelte, so literal HTML markup is present by construction. Grep `src/routes/**/*.svelte` for `<script src=`, `<iframe`, `<object`, `<embed`. (A `<script>` block at the top of a `.svelte` file is the component's own module script — the concern is a `<script src=…>` pointing off-origin, or an embedded third-party frame.) Any off-origin hit is at minimum a Medium — the legal pages should be pure prose; raw off-origin script tags suggest tracker drift.
   - The CV page and other long-form content may legitimately use `<dl>` / `<details>` HTML — those are fine. The concern is off-origin script / iframe / embed.

3. **Client-side DOM injection.**
   - SvelteKit's client router performs soft navigation between prerendered routes, and `src/routes/+layout.svelte` wires the View Transitions API cross-fade. There is no hand-rolled `fetch()`-and-inject bundle. **But** confirm no component uses `window.location.hash` / `search` to construct an element ID or selector without escaping — that's the typical XSS sink in SPA-like navigation.
   - If any component reads `$page.url` or other router state and writes it into the DOM, confirm it goes through a text binding (`{value}`), not `{@html}` or a raw `innerHTML` assignment.

4. **Dynamic `href` / `src` in components.**
   - Grep `src/` for `href={` and `src={` (Svelte attribute bindings). For each, confirm the interpolated value can't be a `javascript:` or `data:` scheme. Route paths and links sourced from `src/lib/site.ts` are author-controlled; fine. A URL threaded from runtime state would be a finding if any exist.

5. **Inline event handlers and `style="..."` attributes.**
   - Grep `src/` for `onclick=`, `onerror=`, `onload=` written as literal HTML attributes (as opposed to Svelte's `onclick={...}` / `on:click` directives, which are fine). Any literal inline handler is at least Medium.
   - Inline `style="..."` is not XSS per se but is a code-smell — surface as Low.

## Expected finding state

For this repo, the expected state is **at most a small number of Notes** (e.g. "no `{@html}` uses, or all wrap author-written static content — fine"). A High / Critical finding indicates real XSS surface.

## Report

- **High** — operator/user-controllable string reaches the DOM as HTML without sanitisation, or as a `href`/`src` value that could be `javascript:`.
- **Medium** — raw off-origin `<script>` / `<iframe>` in a component (also a privacy-policy finding — see `/audit/cookie-consent`); an `{@html}` on a value whose provenance is unclear.
- **Low** — inline event handlers, `style="..."`, or other code-smell that isn't immediately exploitable but makes future XSS easy to introduce.

For each: file:line, the source of the dynamic value, the rendering site, the missing escape / sanitiser.

## Useful starting points

- `src/routes/+layout.svelte` — the shared layout and the View Transitions wiring; any `{@html}` calls would live here
- `src/routes/+page.svelte` and `src/routes/{services,capabilities,cv,terms,privacy,refunds,contact}/+page.svelte` — the page markup
- `src/lib/components/*.svelte` (Sidebar, Footer) — shared component markup and any client-side DOM behaviour
- the legal-page routes are hand-written prose markup; any embedded off-origin `<script>` / `<iframe>` / `<embed>` beyond `<dl>` / `<details>` / structural elements is suspicious

## Delegate to

Use the `repo-security-auditor` agent: `"Audit component and rendering paths for XSS — Svelte {@html} usage, raw embedded HTML in components, client code that interpolates URL state."`

Read-only. Report findings; don't patch without confirmation.
