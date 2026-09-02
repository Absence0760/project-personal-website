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

# Vitest unit suite (src/**/*.test.ts). Node environment — no DOM.
pnpm test

# Playwright browser suite (e2e/). Runs against ./build, so build first:
#   pnpm build && pnpm test:e2e
# Needs the browser once per machine: pnpm exec playwright install chromium
pnpm test:e2e

# Validate the root package.json script layout (estate format guard).
pnpm test:scripts
```

Unlike the old Zola setup, `pnpm install` **is** required — the site now has a
real dependency tree (SvelteKit / Vite / Svelte, all devDependencies). CI runs
`pnpm install --frozen-lockfile` then `pnpm check`, `pnpm test`, `pnpm build`,
`pnpm build:pdf`, and `pnpm test:e2e` (all in the one `Build` job, which is what
the required `CI gate` check aggregates).

## What each gate can and cannot see

Worth knowing before trusting a green run, because the boundary is where three
bugs shipped:

| Gate | Catches | Blind to |
| --- | --- | --- |
| `pnpm check` | types, Svelte diagnostics | anything valid-but-wrong. `scrollIntoView` is impeccably typed |
| `pnpm test` | pure logic, `src/**/*.test.ts` | the DOM entirely — the Vitest environment is `node` |
| `pnpm build` | compiles + prerenders | a page that renders and then misbehaves |
| `pnpm test:e2e` | real browser behaviour: scroll, navigation, 404, off-origin requests | anything visual — it asserts behaviour, not appearance |

The e2e suite exists because the first three are all structurally incapable of
noticing a page that renders perfectly and then fights the reader's scroll,
which is what shipped. It is **not** a visual-regression suite; screenshots
remain the operator's call.

`pnpm test:e2e` serves `./build` through `scripts/serve_build.mjs` rather than
`pnpm preview`, because preview answers an unknown URL with SvelteKit's own
error page while GitHub Pages serves the static `build/404.html`. The suite has
to see what visitors see.

Note the dev server (`pnpm dev`) does **not** serve `/cv.pdf` — the PDF only
exists in `./build` after `pnpm build && pnpm build:pdf`, so the CV page's
download button 404s in dev. Use `pnpm preview` to exercise it locally.

The toolchain (Node 22, pnpm) is pinned in `.tool-versions` and `package.json`
(`engines` + `packageManager`). `pnpm build` writes to `build/` — the static
artifact GitHub Pages serves.
