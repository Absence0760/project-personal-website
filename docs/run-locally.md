# Running locally

This is a SvelteKit static site. `package.json` holds the canonical scripts;
run them with `pnpm <script>`.

```bash
# First time (and after pulling dependency bumps): install deps.
pnpm install

# Start the Vite dev server with live reload (http://localhost:7777)
pnpm dev

# Prerender the whole site into ./build (adapter-static, full prerender).
# This is what the deploy workflow uploads to GitHub Pages (after build:pdf).
pnpm build

# Generate build/cv.pdf by printing the built /cv/ page with headless
# Chromium (scripts/generate_cv_pdf.mjs). Run after `pnpm build`. Needs the
# Playwright browser once per machine: pnpm exec playwright install chromium
pnpm build:pdf

# Serve the built ./build output as it will be served in production
# (http://localhost:8888)
pnpm preview

# Type-check + Svelte component diagnostics (runs `svelte-kit sync` first).
pnpm check

# Vitest unit suite (src/**/*.test.ts).
pnpm test

# Validate the root package.json script layout (estate format guard).
pnpm test:scripts
```

Unlike the old Zola setup, `pnpm install` **is** required — the site now has a
real dependency tree (SvelteKit / Vite / Svelte, all devDependencies). CI runs
`pnpm install --frozen-lockfile` then `pnpm check`, `pnpm test`, `pnpm build`,
and `pnpm build:pdf` (with a Playwright-Chromium install step before it); a
green build + green check is the verification surface.

Note the dev server (`pnpm dev`) does **not** serve `/cv.pdf` — the PDF only
exists in `./build` after `pnpm build && pnpm build:pdf`, so the CV page's
download button 404s in dev. Use `pnpm preview` to exercise it locally.

The toolchain (Node 22, pnpm) is pinned in `.tool-versions` and `package.json`
(`engines` + `packageManager`). `pnpm build` writes to `build/` — the static
artifact GitHub Pages serves.
