# Design system

The site's visual language lives in a **single global stylesheet**,
`src/app.css` — design tokens plus every component's styling, imported once in
`src/routes/+layout.svelte`. There is no CSS framework, no utility classes, and
(deliberately) **no external fonts, scripts, or stylesheets** — the Privacy
Policy commits the site to being first-party only, so the type stack is limited
to the OS's own fonts. Keep it that way; adding a `<link>` to a font host is a
policy change before it's a design change (see `../CLAUDE.md`).

## Direction

"Professional software engineering practice," in a **product / agency** key:
a bold gradient hero, elevated cards with hover-lift, deliberate depth, and a
monospace accent for the technical voice. It is intentionally **not** a blog —
no serif body text, no long-form essay column as the default.

## Tokens (`:root` in `app.css`)

- **Type** — `--font-sans` (system UI stack) for everything; `--font-mono`
  (`ui-monospace` stack) for eyebrows, labels, section headings, tech chips,
  and the monogram. No serif anywhere.
- **Surfaces / lines** — `--bg`, `--surface`, `--surface-2`, `--border`,
  `--border-strong`.
- **Accent** — `--accent` (blue) + `--accent-2` (cyan) drive the gradient
  monogram, hero top-rule (`--accent-line`), and `--accent-soft` tints.
- **Depth** — `--shadow-sm|md|lg` give cards and buttons elevation.
- **Geometry** — `--radius` (8px) for controls, `--radius-lg` (16px) for
  cards / panels; `--sidebar-w` for the rail.

Dark mode is a contrast-tuned Tokyo Night palette in a single
`@media (prefers-color-scheme: dark)` block that overrides the tokens. The
landing page adds a second, independent `--l-*` token layer on top of this —
see "Landing page" below.

## Layout

`src/routes/+layout.svelte` branches on the route:

- **The landing page (`/`) opts out of the shell** and renders its own masthead,
  hero, bands and footer card — see "Landing page" below.
- **Every other route** is wrapped in `.home-layout` — a two-column grid: a
  sticky **identity rail** (`Sidebar.svelte`: gradient monogram, name,
  `site.role`, tagline, primary nav with an **active** state via `aria-current`)
  beside `.page-content`. Below ~760px the grid collapses to one column and the
  nav becomes a horizontal row.

## Component vocabulary

- **`.hero`** — gradient panel with a mono `.hero-eyebrow`, oversized tight
  headline, muted lead, and a `.btn` row. `.btn-arrow` adds the nudging arrow.
- **`.stream-card`** — elevated card, `.stream-tag` mono pill label, hover-lift.
- **Selected work** — lives on the landing page now (`WorkRow.svelte`); see
  "Landing page" below. The old auto-rotating `ProjectCarousel.svelte` and its
  `<noscript>` grid fallback in `app.html` were removed with it.
- **`.page-content h2`** — mono uppercase section eyebrow (shared by all pages).
- **`.prose` / `.post-content`** — sans-serif long-form for Services,
  Capabilities, and the legal pages. `.capability-data` is a two-column
  label/value data sheet.
- **`.cv`** — résumé layout reusing the mono section-heading pattern. Opens
  with a `.cv-actions` row holding a `.btn btn-primary` download link to
  `/cv.pdf`. That PDF is **generated from this page at build time**
  (`pnpm build:pdf` → `scripts/generate_cv_pdf.mjs` prints the prerendered
  `/cv/` with headless Chromium), so page and PDF can't drift. The
  `@media print` block at the end of `app.css` is what the PDF renders:
  sidebar/footer/button hidden, and the screen-hidden `.cv-print-header`
  (name · role · email · site) shown in their place.

## Landing page

The landing page (`src/routes/+page.svelte`) is a **separate composition** from
the rest of the site. `+layout.svelte` checks the pathname and renders it
without the sidebar shell, so it owns its own masthead, hero, section bands and
footer card. Everything it needs is namespaced `--l-*` / `.landing` /
`.masthead` / `.sheet` / `.landing-footer` in `app.css`, under the
`LANDING PAGE` banner — it can hold a deeper, more saturated palette than the
prose pages without leaking into them, the CV, or the print stylesheet.

**Two compositions ship, not one responsive layout.** They split at 720px and
1080px, and what changes between them is structural:

| | ≥1080px | 720–1079px | <720px |
| --- | --- | --- | --- |
| Masthead | 88px lockup band over a 56px nav rail, static | same, plus the menu button | 56px **fixed** bar, lockup only, backdrop blur |
| Navigation | the rail | rail + sheet (sheet is additive: routes, email, GitHub) | the sheet **is** the navigation |
| Hero graphic | co-equal subject, bleeding past the right margin | same | **atmosphere** — recropped, 4 bands not 7, dimmed and scrimmed behind the copy |
| Selected work | 3-up grid | 2-up grid | snap-scroller, 82vw cards, peek + progress track |
| Stream card | 56px icon tile above the heading | same | 40px tile inline beside it |
| CTAs | inline pair | inline pair | full-width stacked, 52px |
| Footer links | inline row | inline row | 2×2 grid |

### Tokens

The `--l-*` block carries its own ground/line/text/accent scales plus spacing
(`--s-1`…`--s-15`, 4px base), radii (`--r-xs`…`--r-full`), four easing curves
(`--ease-out-expo`, `--ease-out-quart`, `--ease-spring`, `--ease-ambient`), a
type scale (`--fs-display` … `--fs-role`) and a three-step elevation ladder.
A **computed contrast table** sits as a comment directly above the block and
covers both schemes; keep it accurate when you touch a colour. Two rules the
table encodes:

- `--l-accent` is a **fill**, never text — `#2563EB` on the navy field is
  2.66:1. Accent text is always `--l-accent-text`.
- `--l-fg-dim` never carries anything a visitor must read: chips, indices and
  the copyright line only.

On the dark scheme, depth comes from **border luminance plus an inset top
highlight** rather than drop shadows — a shadow on a near-black field is
decoration that does nothing. The light twin uses a conventional shadow ladder.

### Hero graphic

`HeroRibbon.svelte` is hand-authored inline SVG (~9 kB, no raster, no external
asset, zero `<filter>` elements). Seven bands, each an **open arc at an authored
start angle** — the asymmetry is in the markup, not in the animation, so a
`prefers-reduced-motion` visitor sees the same composed arrangement everyone
else does. Per band, back to front: an offset low-opacity occlusion pair (the
contact shadow that makes bands sit in front of one another), three tapering
sub-arcs sharing one gradient whose narrow specular crest is what reads as
gloss, and a dashed rim hairline. A single radial-gradient bloom sits behind
everything.

Colours come from `app.css` **by class**, never from inline attributes:
`var()` is not honoured inside SVG presentation attributes, so class-based
styling is the only way both palettes can drive the same markup.

Motion: per-band rotation (28–74s, alternating direction), a 13s cluster
breathe, and a pointer parallax where the far bands move at roughly half the
near ones. All of it pauses when the graphic scrolls off-screen or the tab is
backgrounded, and stops entirely under reduced motion.

### Motion

- **Hero entrance** is a pure-CSS sequence — identity, context, claim, proof,
  action — settled at 1080ms. No observer is involved; above-the-fold content
  never waits on one. The signature beat is the two accent words colouring in
  at 620ms, after the headline has landed neutral.
- **Below the fold**, `src/lib/reveal.ts` runs one shared `IntersectionObserver`
  that adds `.is-in`. Reveals are one-way and stagger 70ms, capped at three
  items. The hidden state is gated on a `js` class set by a **first-party inline
  script** in `app.html`'s `<head>` before first paint, so no-JS visitors never
  have anything hidden and nobody sees a visible→hidden flash.
- In/out transitions are deliberately **asymmetric** (≈180ms in, ≈240ms out).
- `prefers-reduced-motion` **removes** motion rather than shortening it, and the
  ribbon's pointer listener is never attached — re-evaluated on `change`, so
  toggling the OS setting takes effect without a reload.

### Component vocabulary

`.masthead` (+ `.lockup`, `.menu-button`, `.masthead-rail`) · `.sheet` (the
full-screen nav overlay: focus trap, Escape, `inert` on the page behind, scroll
position preserved and restored) · `.hero` / `.hero-title` / `.hero-accent` ·
`.band` + `.band-head` / `.band-label` / `.band-rule` (a **fading** hairline) /
`.band-action` · `.button` (`-primary` / `-outline`) · `.stream-card` ·
`.work-card` with its `.work-preview` panel and overlapping `.work-badge` ·
`.chips` · `.landing-footer-card`.

`WorkThumb.svelte` draws the preview panels. They are **abstractions, not
screenshots** — nothing on the page purports to show a real client site, and the
`kind` badge labels what a project *is* rather than implying who it was for.

## Brand assets

The identity is a **JH ligature** — the J's stem is shared with the H's left
post and hooks underneath — in white on the blue→cyan brand gradient, matching
`--accent`/`--accent-2`. The same mark appears in the browser tab, the sidebar
rail (inlined as an SVG glyph in `Sidebar.svelte`), and the logo lockup, so the
brand reads consistently everywhere.

All assets are hand-authored SVG rendered locally with Inkscape + ImageMagick
(no web icon services), and live in `static/`:

- `favicon.svg` — scalable mark (rounded squircle), the primary tab icon.
- `icon-maskable.svg` — full-bleed variant for iOS/PWA (the platform masks the
  corners); source for the raster icons below.
- `favicon.ico` (16/32/48), `favicon-96x96.png`, `apple-touch-icon.png` (180),
  `icon-192.png` / `icon-512.png` (maskable, referenced by
  `manifest.webmanifest`).
- `logo.svg` / `logo-light.svg` — horizontal lockup (mark + "Jared Howard" in
  Montserrat ExtraBold, converted to paths so the file is self-contained + a
  mono-spaced "SOFTWARE ENGINEER" line) for dark-on-light and light-on-dark use.

The `<head>` links plus `<meta name="theme-color">` are wired in `app.html`. To
regenerate the rasters after editing an SVG, re-run the Inkscape/ImageMagick
export steps (Inkscape `--export-type=png --export-width=N`; `magick` to build
the multi-res `.ico`).

## Accessibility

- Global `:focus-visible` ring (keyboard only). The landing page overrides it
  with a `--l-focus` ring at 2px offset plus a dark inner separator, so the
  indicator reads on both the deep field and the blue button fill.
- One `<h1>` per page: the sidebar brand is a link, not a heading, so each
  page's own `<h1>` (hero / prose-header / CV) is the sole top heading.
- `prefers-reduced-motion` disables hover transforms, view-transition
  cross-fades, and smooth scroll.

## Changing it

Restyle in `app.css` — that keeps the whole site coherent. Editing markup in a
page component is only for new content structure (a new section, a new card),
not styling. Any layout/component change updates **this file** in the same
change (repo rule), and if it touches a legal route's markup, run the
`docs/legal-status.md` tracker too.
