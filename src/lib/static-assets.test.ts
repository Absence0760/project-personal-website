import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Guards for the files under static/, which the build copies verbatim into
// build/ without ever type-checking, compiling or linting them. Three stale
// artefacts from the pre-redesign site survived the site-wide restyle purely
// because nothing here looked at them:
//
//   - static/404.html still carried the old palette and had no footer, so the
//     one page a lost visitor lands on was the one page off-design and missing
//     the legal links.
//   - manifest.webmanifest still carried the old theme/background colours; the
//     restyle updated the <meta name="theme-color"> tags and stopped there.
//   - four icon/logo files were shipping publicly with nothing referencing them.
//
// These tests are cheap and specific, and each one fails on the exact drift
// that got through.

const root = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf-8');

const appCss = read('src/app.css');
const notFound = read('static/404.html');
const appHtml = read('src/app.html');
const manifest = JSON.parse(read('static/manifest.webmanifest'));

/** Value of a custom property in app.css. Index 0 is the light (`:root`) block, 1 the dark one. */
function token(name: string, scheme: 'light' | 'dark'): string {
	const hits = [...appCss.matchAll(new RegExp(`(?<![-\\w])${name}:\\s*([^;]+);`, 'g'))].map((m) =>
		m[1].trim()
	);
	const value = hits[scheme === 'light' ? 0 : 1];
	if (!value) throw new Error(`app.css does not define ${name} for the ${scheme} scheme`);
	return value;
}

/** Value of a custom property inside 404.html's inline `<style>`, per scheme block. */
function inlineVar(name: string, scheme: 'light' | 'dark'): string {
	// The dark overrides live in the single `@media (prefers-color-scheme: dark)` block.
	const darkStart = notFound.indexOf('@media (prefers-color-scheme: dark)');
	expect(darkStart, '404.html should keep a dark-scheme block').toBeGreaterThan(-1);
	const haystack =
		scheme === 'light' ? notFound.slice(0, darkStart) : notFound.slice(darkStart);
	const m = haystack.match(new RegExp(`--${name}:\\s*([^;]+);`));
	if (!m) throw new Error(`404.html does not define --${name} for the ${scheme} scheme`);
	return m[1].trim();
}

describe('static/404.html', () => {
	// GitHub Pages serves this file on a direct hit to an unknown URL, so it is
	// a full document load that never touches app.css. It has to inline its own
	// palette, which is exactly how the previous one drifted.
	const cases: Array<[string, string]> = [
		['ground', '--l-ink-950'],
		['fg', '--l-fg'],
		['muted', '--l-fg-muted'],
		['link', '--l-accent-text'],
		['line', '--l-line']
	];

	for (const [local, cssToken] of cases) {
		for (const scheme of ['light', 'dark'] as const) {
			it(`--${local} matches ${cssToken} in the ${scheme} scheme`, () => {
				expect(inlineVar(local, scheme)).toBe(token(cssToken, scheme));
			});
		}
	}

	it('uses the same system-font stack as app.css, and loads no font', () => {
		const sans = token('--font-sans', 'light');
		const normalise = (s: string) => s.replace(/\s+/g, ' ');
		expect(normalise(notFound)).toContain(normalise(sans));
		expect(notFound).not.toMatch(/@font-face/i);
	});

	it('carries all four legal footer links, like every other page', () => {
		for (const href of ['/contact/', '/terms/', '/privacy/', '/refunds/']) {
			expect(notFound, `404.html is missing the ${href} footer link`).toContain(`href="${href}"`);
		}
	});

	it('makes no third-party request (Privacy §4/§8 is first-party only)', () => {
		expect(notFound).not.toMatch(/<script/i);
		// Any absolute URL would be an off-origin fetch or an outbound link; this
		// page needs neither.
		expect(notFound).not.toMatch(/https?:\/\//i);
	});
});

describe('static/manifest.webmanifest', () => {
	it('theme and background colours match the light-scheme theme-color meta', () => {
		const meta = appHtml.match(
			/<meta name="theme-color" media="\(prefers-color-scheme: light\)" content="([^"]+)"/
		);
		expect(meta, 'app.html should declare a light-scheme theme-color').not.toBeNull();
		const light = meta![1];
		expect(manifest.theme_color).toBe(light);
		expect(manifest.background_color).toBe(light);
	});

	it('references only icons that exist', () => {
		const present = new Set(readdirSync(join(root, 'static')));
		for (const icon of manifest.icons) {
			expect(present, `manifest references a missing icon: ${icon.src}`).toContain(
				icon.src.replace(/^\//, '')
			);
		}
	});
});

describe('static/ has no orphans', () => {
	// Nothing in the source links these, so a grep alone would call them dead.
	// Each is here on purpose — the reason is the point of the list, because
	// "unreferenced" and "safe to delete" are not the same question, and
	// treating them as one nearly cost this repo its icon-regeneration source.
	const byConvention = new Set([
		'.nojekyll', // tells Pages not to run Jekyll
		'CNAME', // custom-domain binding
		'robots.txt', // crawler entry point
		'404.html', // served by Pages on an unresolved URL
		// Brand + icon assets, all documented in docs/design-system.md →
		// "Identity". Unreferenced by the site itself and that is expected:
		'icon-maskable.svg', // SOURCE for the icon-192/icon-512 rasters
		'logo.svg', // horizontal lockup, dark-on-light, for off-site use
		'logo-light.svg', // same lockup, light-on-dark
		'favicon-96x96.png' // legacy raster size some Android browsers pick up
	]);

	it('every file is referenced by the source, the manifest, or Pages convention', () => {
		const haystack = [
			read('src/app.html'),
			read('static/manifest.webmanifest'),
			read('static/404.html'),
			...readdirSync(join(root, 'src', 'lib'))
				.filter((f) => f.endsWith('.ts') || f.endsWith('.svelte'))
				.map((f) => read(join('src', 'lib', f)))
		].join('\n');

		const orphans = readdirSync(join(root, 'static')).filter(
			(f) => !byConvention.has(f) && !haystack.includes(f)
		);

		expect(orphans, `unreferenced files in static/: ${orphans.join(', ')}`).toEqual([]);
	});
});
