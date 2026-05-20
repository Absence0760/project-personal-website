---
description: WCAG 2.2 AA pass on the deployed bundle — heading hierarchy, alt text, chip-filter keyboard nav, contrast
---

Audit accessibility on the deployed web bundle.

## Goal

US Title III (ADA) and the EU EAA (in force from 2025-06-28) both converge on WCAG 2.2 AA for consumer-facing web surfaces. The site is currently US-targeted, so ADA is the primary regime, but the EU EAA wouldn't catch this site at scale either way — the actionable bar is WCAG 2.2 AA.

The audit's job is to find every place the deployed bundle misses the bar. The surface is small: a sidebar + content layout, four legal pages, a notes list with a chip filter, a CV section, and a CV PDF. Mobile / watch surfaces are out of scope — they don't exist.

## What to check

1. **Semantic HTML in templates.**
   - `templates/base.html`: the page chrome should use `<main>`, `<aside>`, `<nav>`, `<footer>` (it does — check). The `<aside>` should have an `aria-label` ("Sidebar" or similar) since there's only one but it's still navigation-shaped.
   - `templates/section.html`: the chip filter is a row of `<button>` elements — confirm they're `<button>`, not `<div onclick>` or `<a>`. They need `aria-pressed` to communicate filter state to screen-readers.
   - `templates/index.html`: `<ul class="intro-tags">` uses emoji-prefixed items. Each emoji is decorative; the surrounding text carries the meaning, so the emoji should have `aria-hidden="true"` or be wrapped to avoid being read out twice ("location pin United States" vs just "United States").

2. **Heading hierarchy.**
   - One `<h1>` per page. Walk every `templates/*.html` and every `content/*.md` that renders as a top-level page.
   - No skips (`<h1>` → `<h3>` without an `<h2>`). The long legal pages (`terms.md`, `privacy.md`) are particularly prone to this.

3. **Alt text.**
   - Every `<img src=`, every `<svg role="img">`, every CSS `background-image` on a content-bearing element. The inline GitHub SVG in `templates/index.html` should have `aria-label="GitHub"` or `role="img"` + accessible name (currently it lacks both — finding).
   - The CV PDF link (`/cv.pdf` or however it surfaces) should announce "CV (PDF, ~9MB)" so screen-reader users know what they're downloading.

4. **Color contrast.**
   - Read `static/css/style.css`. Check every text colour against its background — ≥ 4.5:1 for body text, ≥ 3:1 for large text (≥18px or ≥14px bold) and UI components.
   - Dark-mode (if present via `prefers-color-scheme`) must clear the bar independently.

5. **Keyboard navigation.**
   - Tab order through the sidebar nav, content links, footer legal links should be logical.
   - Chip filter on the notes page must be keyboard-reachable (`<button>` is fine) and the focus state must be visible. `static/js/tag-filter.js` should respond to Enter and Space (default `<button>` behaviour — confirm no `preventDefault` interference).
   - Internal-navigation transitions in `static/js/transitions.js` must not steal focus or scroll position in a way that breaks keyboard users.

6. **Focus visible.**
   - `:focus-visible` ring on every interactive. Grep `static/css/style.css` for `:focus`, `:focus-visible`, `outline`. A site-wide `outline: none` without a compensating ring is a WCAG 2.4.7 fail.

7. **Live regions.**
   - The chip filter shows "No posts match" when the filter produces zero results. That message should be in an `aria-live="polite"` region so screen readers announce it on state change.

8. **Skip link.**
   - `templates/base.html` should have a "Skip to main content" link as the first element inside `<body>`, hidden until focus. It currently does not — finding.

9. **Reduce motion.**
   - `static/js/transitions.js` runs a fade swap on internal navigation. Confirm it respects `prefers-reduced-motion: reduce` (either by skipping the fade entirely or by setting `transition-duration: 0`).
   - Same for any CSS animation in `static/css/style.css`.

10. **Legal-page readability.**
    - The four legal pages are dense. Confirm the body uses a comfortable line-height (~1.5-1.6), the column max-width is ≤ ~75ch, and `<h2>` / `<h3>` rhythm provides clear scanability. WCAG doesn't mandate any of this specifically; cite as best-practice if the rhythm has drifted.

## Report

- **Critical** — a flow is unreachable without sight or without pointer (image-only nav, modal trap, no keyboard route through the chip filter).
- **High** — WCAG 2.2 AA fail that's clearly testable (contrast ratio < 4.5:1, missing alt / aria-label, no `:focus-visible` outline, skipped heading level).
- **Medium** — best-practice gap (no skip link, no `aria-live` on filter result, motion-reduce not honoured).
- **Low** — polish (focus ring style, decorative emoji not marked `aria-hidden`, link-text could be more descriptive than "click here").

For each: file:line, the success criterion (e.g. WCAG 2.4.7 Focus Visible, 1.4.3 Contrast Minimum), and the fix.

End with a **clean** section listing the surfaces you walked and found nothing on.

## Delegate to

Use the `compliance-auditor` agent: `"Audit accessibility on this static site's deployed bundle per WCAG 2.2 AA. Mobile / watch / native surfaces do not exist — web only."`

Read-only. Findings only.
