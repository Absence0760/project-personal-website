# Running locally

This is a SvelteKit static site. `package.json` holds the canonical scripts;
run them with `pnpm <script>`.

```bash
# First time (and after pulling dependency bumps): install deps.
pnpm install

# Start the Vite dev server with live reload (http://localhost:7777)
pnpm dev

# Prerender the whole site into ./build (adapter-static, full prerender).
# This is exactly what the deploy workflow uploads to GitHub Pages.
pnpm build

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
`pnpm install --frozen-lockfile` then `pnpm check`, `pnpm test`, and
`pnpm build`; a green build + green check is the verification surface.

The toolchain (Node 22, pnpm) is pinned in `.tool-versions` and `package.json`
(`engines` + `packageManager`). `pnpm build` writes to `build/` — the static
artifact GitHub Pages serves.
