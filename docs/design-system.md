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
`@media (prefers-color-scheme: dark)` block that overrides the tokens.

## Layout

`src/routes/+layout.svelte` wraps every page in `.home-layout` — a two-column
grid: a sticky **identity rail** (`Sidebar.svelte`: gradient monogram from
`site.initials`, name, `site.role`, tagline, primary nav with an **active**
state via `aria-current`) beside `.page-content`. Below ~760px the grid
collapses to one column and the nav becomes a horizontal row.

## Component vocabulary

- **`.hero`** — gradient panel with a mono `.hero-eyebrow`, oversized tight
  headline, muted lead, and a `.btn` row. `.btn-arrow` adds the nudging arrow.
- **`.stream-card`** — elevated card, `.stream-tag` mono pill label, hover-lift.
- **Selected work** — `Sidebar`'s sibling `ProjectCarousel.svelte` renders
  `site.projects` (each a `Project` with a GitHub `repo` and an optional live
  `url`) as an auto-rotating slideshow of `.project-card`s. Each card carries a
  `.project-links` footer — a GitHub link plus a `.project-link-live` "Visit
  site" link when the project has a `url`. Controls: prev/next arrows, dot
  indicators, pause on hover/focus, arrow-key nav, and `inert` on off-screen
  slides. It is **progressive enhancement**: the single-slide track is the
  default layout so the first paint already looks like the carousel (no flash
  of a grid before hydration), and the arrow/dot controls render on mount. A
  `<noscript>` block in `app.html` restores a stacked grid of every card for
  visitors without JavaScript. Auto-rotation and the slide transition are
  disabled under `prefers-reduced-motion`.
- **`.page-content h2`** — mono uppercase section eyebrow (shared by all pages).
- **`.prose` / `.post-content`** — sans-serif long-form for Services,
  Capabilities, and the legal pages. `.capability-data` is a two-column
  label/value data sheet.
- **`.cv`** — résumé layout reusing the mono section-heading pattern.

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

- Global `:focus-visible` ring (keyboard only).
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
