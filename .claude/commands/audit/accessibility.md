---
description: WCAG 2.2 AA pass on the deployed bundle — heading hierarchy, alt text, keyboard focus order, contrast
---

Audit accessibility on the deployed web bundle.

## Goal

US Title III (ADA) and the EU EAA (in force from 2025-06-28) both converge on WCAG 2.2 AA for consumer-facing web surfaces. The site is currently US-targeted, so ADA is the primary regime, but the EU EAA wouldn't catch this site at scale either way — the actionable bar is WCAG 2.2 AA.

The audit's job is to find every place the deployed bundle misses the bar. The surface is small: a sidebar + content layout, a home page, a services page, a capability statement, the four legal pages, a CV page, and a CV PDF. Mobile / watch surfaces are out of scope — they don't exist.

## What to check

1. **Semantic HTML in the layout and components.**
   - `src/routes/+layout.svelte` (with `Sidebar.svelte` / `Footer.svelte`): the page chrome should use `<main>`, `<aside>`, `<nav>`, `<footer>` (it does — check). The `<aside>` should have an `aria-label` ("Sidebar" or similar) since there's only one but it's still navigation-shaped.
   - `src/routes/+page.svelte`: any emoji-prefixed intro items are decorative; the surrounding text carries the meaning, so each emoji should have `aria-hidden="true"` or be wrapped to avoid being read out twice ("location pin United States" vs just "United States").

2. **Heading hierarchy.**
   - One `<h1>` per page. Walk every route `+page.svelte` under `src/routes/`.
   - No skips (`<h1>` → `<h3>` without an `<h2>`). The long legal pages (Terms, Privacy) are particularly prone to this.

3. **Alt text.**
   - Every `<img src=`, every `<svg role="img">`, every CSS `background-image` on a content-bearing element. The inline GitHub SVG in `src/routes/+page.svelte` (or `Sidebar.svelte`) should have `aria-label="GitHub"` or `role="img"` + accessible name — confirm it has both.
   - The CV PDF link (`/cv.pdf` or however it surfaces) should announce "CV (PDF, ~9MB)" so screen-reader users know what they're downloading.

4. **Color contrast.**
   - Read `src/app.css`. Check every text colour against its background — ≥ 4.5:1 for body text, ≥ 3:1 for large text (≥18px or ≥14px bold) and UI components.
   - Dark-mode (if present via `prefers-color-scheme`) must clear the bar independently.

5. **Keyboard navigation.**
   - Tab order through the sidebar nav, content links, footer legal links should be logical.
   - The View Transitions cross-fade wired in `src/routes/+layout.svelte` must not steal focus or scroll position in a way that breaks keyboard users.

6. **Focus visible.**
   - `:focus-visible` ring on every interactive. Grep `src/app.css` for `:focus`, `:focus-visible`, `outline`. A site-wide `outline: none` without a compensating ring is a WCAG 2.4.7 fail.

7. **Skip link.**
   - `src/routes/+layout.svelte` should have a "Skip to main content" link as the first focusable element, hidden until focus. If it doesn't — finding.

8. **Reduce motion.**
   - The View Transitions cross-fade in `src/routes/+layout.svelte` must respect `prefers-reduced-motion: reduce` (either by skipping the fade entirely or by setting `transition-duration: 0`).
   - Same for any CSS animation in `src/app.css`.

9. **Legal-page readability.**
    - The four legal pages are dense. Confirm the body uses a comfortable line-height (~1.5-1.6), the column max-width is ≤ ~75ch, and `<h2>` / `<h3>` rhythm provides clear scanability. WCAG doesn't mandate any of this specifically; cite as best-practice if the rhythm has drifted.

## Report

- **Critical** — a flow is unreachable without sight or without pointer (image-only nav, modal trap, no keyboard route through the sidebar nav).
- **High** — WCAG 2.2 AA fail that's clearly testable (contrast ratio < 4.5:1, missing alt / aria-label, no `:focus-visible` outline, skipped heading level).
- **Medium** — best-practice gap (no skip link, motion-reduce not honoured).
- **Low** — polish (focus ring style, decorative emoji not marked `aria-hidden`, link-text could be more descriptive than "click here").

For each: file:line, the success criterion (e.g. WCAG 2.4.7 Focus Visible, 1.4.3 Contrast Minimum), and the fix.

End with a **clean** section listing the surfaces you walked and found nothing on.

## Delegate to

Use the `compliance-auditor` agent: `"Audit accessibility on this static site's deployed bundle per WCAG 2.2 AA. Mobile / watch / native surfaces do not exist — web only."`

Read-only. Findings only.
