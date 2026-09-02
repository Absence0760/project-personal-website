import { test, expect } from '@playwright/test';

// The regression this file exists for:
//
// Navigation *looked* like a full page reload. It never was one — the router
// was doing soft navigation correctly the whole time. The cause was the
// cross-fade: `::view-transition-old(root)` captures the entire document, so
// the masthead and footer card — identical on every route, mounted the whole
// time, never changing — faded out and back in on every click. A full-width
// fade of the whole page including the masthead is exactly what a browser does
// on a real page load, so that is what it read as.
//
// Both halves are asserted here, because "it feels like a reload" and "it is a
// reload" are different faults with different fixes, and only measurement
// separates them.

test('internal navigation never reloads the document', async ({ page }) => {
	let documentLoads = 0;
	page.on('load', () => documentLoads++);

	const htmlRequests: string[] = [];
	page.on('request', (req) => {
		if (req.resourceType() === 'document') htmlRequests.push(new URL(req.url()).pathname);
	});

	await page.goto('/', { waitUntil: 'networkidle' });
	const loadsAfterFirstPaint = documentLoads;

	// A value that cannot survive a document swap.
	await page.evaluate(() => {
		(window as unknown as { __persisted?: string }).__persisted = 'survived';
	});

	for (const href of ['/services/', '/work/', '/capabilities/']) {
		await page.click(`a[href="${href}"]`);
		await page.waitForURL(`**${href}`);
		await page.waitForTimeout(350);
	}

	const persisted = await page.evaluate(
		() => (window as unknown as { __persisted?: string }).__persisted ?? null
	);

	expect(persisted, 'the window was replaced — navigation did a full page load').toBe('survived');
	expect(documentLoads - loadsAfterFirstPaint, 'a document load fired during navigation').toBe(0);
	expect(htmlRequests, 'more than the initial document was fetched over the wire').toHaveLength(1);
});

test('the shell is held out of the cross-fade', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });

	// Assert on the mechanism, not on the live element's opacity.
	//
	// The obvious test — sample `getComputedStyle('.masthead').opacity` during a
	// navigation and require it to stay 1 — CANNOT FAIL. A view transition
	// snapshots the old state into `::view-transition-old(root)` and paints that
	// pseudo-element over the live DOM; the real element keeps opacity 1 the
	// whole time, whether or not it is part of the root snapshot. That test was
	// written, passed against the reintroduced bug, and was replaced by this.
	//
	// A non-`none` view-transition-name is what actually promotes an element to
	// its own snapshot and out of `(root)`, so it is the thing worth asserting:
	// delete either CSS rule and this fails immediately.
	const names = await page.evaluate(() => {
		const nameOf = (selector: string) => {
			const el = document.querySelector(selector);
			return el ? getComputedStyle(el).viewTransitionName : 'ELEMENT MISSING';
		};
		return { masthead: nameOf('.masthead'), footer: nameOf('.landing-footer') };
	});

	expect(
		names.masthead,
		'the masthead has no view-transition-name, so it fades with the page content and navigation reads as a full reload'
	).not.toBe('none');
	expect(
		names.footer,
		'the footer card has no view-transition-name, so it fades with the page content'
	).not.toBe('none');
});

test('the transition actually runs, and names the shell separately', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });

	const supported = await page.evaluate(() => typeof document.startViewTransition === 'function');
	test.skip(!supported, 'browser has no View Transitions API — the site hard-swaps, which is fine');

	// Catch the animations the browser creates for the transition. Their
	// pseudo-elements name the snapshots, so the shell's own groups appearing
	// here is direct evidence it was lifted out of `root`.
	await page.evaluate(() => {
		(window as unknown as { __pseudos: string[] }).__pseudos = [];
	});

	const navigation = page.click('a[href="/services/"]');
	for (let i = 0; i < 12; i++) {
		await page.waitForTimeout(25);
		await page.evaluate(() => {
			for (const a of document.getAnimations()) {
				const pseudo = (a.effect as KeyframeEffect | null)?.pseudoElement;
				if (pseudo) (window as unknown as { __pseudos: string[] }).__pseudos.push(pseudo);
			}
		});
	}
	await navigation;

	const pseudos = await page.evaluate(
		() => (window as unknown as { __pseudos: string[] }).__pseudos
	);
	const joined = pseudos.join(' ');

	expect(pseudos.length, 'no view-transition animations ran at all').toBeGreaterThan(0);
	expect(
		joined,
		`the masthead was not given its own transition group; pseudo-elements seen: ${[...new Set(pseudos)].join(', ')}`
	).toContain('masthead');
});

test('a view-transition-name is never duplicated', async ({ page }) => {
	// A duplicate name makes the browser abort the transition outright, so the
	// fade silently degrades to a hard swap. Nothing else would notice.
	await page.goto('/', { waitUntil: 'networkidle' });

	const counts = await page.evaluate(() => ({
		masthead: document.querySelectorAll('.masthead').length,
		footer: document.querySelectorAll('.landing-footer').length
	}));

	expect(counts.masthead, 'more than one .masthead — the view transition will abort').toBe(1);
	expect(counts.footer, 'more than one .landing-footer — the view transition will abort').toBe(1);
});

test('navigation leaves no console errors', async ({ page }) => {
	const errors: string[] = [];
	page.on('console', (m) => {
		if (m.type() === 'error') errors.push(m.text());
	});
	page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

	await page.goto('/', { waitUntil: 'networkidle' });
	for (const href of ['/work/', '/cv/', '/contact/', '/']) {
		await page.click(`a[href="${href}"]`);
		await page.waitForURL(`**${href}`);
		await page.waitForTimeout(300);
	}

	expect(errors).toEqual([]);
});
