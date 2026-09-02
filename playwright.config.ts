import { defineConfig, devices } from '@playwright/test';

// Browser-level regression suite. It exists because three bugs shipped that
// nothing in the repo could have caught: `pnpm check` type-checks, `pnpm test`
// runs Vitest in the *node* environment with no DOM, and `pnpm build` only
// proves the site compiles. A page that renders perfectly and then fights the
// reader's scroll passes all three.
//
// Scope is deliberately narrow — behaviour that is invisible to the other
// gates and expensive to notice by hand:
//   · scrolling actually makes progress on every page (e2e/scroll.spec.ts)
//   · navigation is client-side and the shell holds still (e2e/navigation.spec.ts)
//   · the deployed artefact's own invariants (e2e/integrity.spec.ts)
//
// It is NOT a visual-regression suite. Screenshots are the operator's call per
// CLAUDE.md; these are assertions about behaviour, which is why they can live
// in CI without becoming a maintenance tax.

const PORT = 4173;

export default defineConfig({
	testDir: 'e2e',
	// The suite asserts on real scroll physics and animation timing, so a
	// flake here usually means a genuine race. One retry in CI absorbs runner
	// noise without hiding a reproducible failure.
	retries: process.env.CI ? 1 : 0,
	forbidOnly: !!process.env.CI,
	reporter: process.env.CI ? [['github'], ['list']] : [['list']],
	// Scroll probes wheel through long pages a step at a time; the default 30s
	// is tight for /terms/ at 12,000px.
	timeout: 90_000,
	expect: { timeout: 10_000 },

	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: process.env.CI ? 'retain-on-failure' : 'off'
	},

	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

	// Serve the built artefact the way GitHub Pages does. `vite preview` would
	// answer unknown URLs with SvelteKit's rendered error page rather than the
	// static build/404.html that visitors actually receive.
	webServer: {
		command: 'node scripts/serve_build.mjs',
		port: PORT,
		env: { PORT: String(PORT) },
		reuseExistingServer: !process.env.CI,
		timeout: 30_000
	}
});
