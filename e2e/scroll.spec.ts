import { test, expect, type Page } from '@playwright/test';

// The regression this file exists for:
//
// SectionRail kept its active marker visible with `scrollIntoView`, which
// scrolls every scrollable ancestor including the document. Marking the active
// item therefore dragged the page back toward the rail while the reader was
// scrolling away from it, and `html { scroll-behavior: smooth }` animated the
// drag. That produced a loop with no exit — scroll down, next heading
// activates, document pulled up, previous heading re-activates — on all eight
// pages carrying a rail. On /work/ at 1440px the scroll position oscillated
// between 259 and 600 and never advanced.
//
// The lesson encoded here: it is not enough to assert a page *renders*. The
// earlier ad-hoc sweep wheel-scrolled these very pages and reported a clean
// pass, because it checked overflow, h1 counts and reveal state — never that
// scrolling made progress. So that is what this asserts, and it is why the
// rail pages are covered at the widths where the rail is actually mounted.

/** Every route carrying a SectionRail. The rail only mounts at >= 1080px. */
const RAIL_ROUTES = [
	'/work/',
	'/services/',
	'/cv/',
	'/capabilities/',
	'/contact/',
	'/terms/',
	'/privacy/',
	'/refunds/'
];

const STEP = 300;
const STEPS = 30;

interface ScrollRun {
	positions: number[];
	backwardJumps: string[];
	maxScroll: number;
}

/** Wheel down the page, recording scrollY after each step. */
async function wheelDown(page: Page): Promise<ScrollRun> {
	// Let hydration settle so the observer is attached before we start.
	await page.waitForTimeout(250);

	const positions: number[] = [];
	for (let i = 0; i < STEPS; i++) {
		await page.mouse.wheel(0, STEP);
		// Long enough for a smooth-scroll animation to land. Sampling mid-flight
		// would report positions no reader ever sees.
		await page.waitForTimeout(110);
		positions.push(await page.evaluate(() => Math.round(window.scrollY)));
	}

	const backwardJumps: string[] = [];
	for (let i = 1; i < positions.length; i++) {
		// A 2px tolerance for sub-pixel rounding; the bug moved hundreds.
		if (positions[i] < positions[i - 1] - 2) {
			backwardJumps.push(`${positions[i - 1]}→${positions[i]}`);
		}
	}

	const maxScroll = await page.evaluate(() =>
		Math.round(document.documentElement.scrollHeight - window.innerHeight)
	);

	return { positions, backwardJumps, maxScroll };
}

test.describe('scrolling makes progress', () => {
	for (const route of RAIL_ROUTES) {
		for (const width of [1080, 1440]) {
			test(`${route} @${width} never scrolls backwards`, async ({ page }) => {
				await page.setViewportSize({ width, height: 900 });
				await page.goto(route, { waitUntil: 'networkidle' });

				const { positions, backwardJumps, maxScroll } = await wheelDown(page);

				expect(
					backwardJumps,
					`the page scrolled back up while wheeling down: ${backwardJumps.join(', ')}`
				).toEqual([]);

				// Progress, not just absence of reversal: a page pinned at the top
				// has no backward jumps either. Cap the expectation at what STEPS
				// can physically cover so long pages aren't held to the impossible.
				const reachable = Math.min(maxScroll, STEP * STEPS);
				expect(
					positions.at(-1) ?? 0,
					`expected to travel most of ${reachable}px, reached ${positions.at(-1)}`
				).toBeGreaterThan(reachable * 0.9);
			});
		}
	}

	test('/work/ below the rail breakpoint still scrolls (control)', async ({ page }) => {
		// The rail is not mounted here, so this isolates the rail as the cause
		// whenever the tests above fail: if this one fails too, the problem is
		// something else entirely.
		await page.setViewportSize({ width: 900, height: 900 });
		await page.goto('/work/', { waitUntil: 'networkidle' });

		const { backwardJumps, positions } = await wheelDown(page);
		expect(backwardJumps).toEqual([]);
		expect(positions.at(-1) ?? 0).toBeGreaterThan(1000);
	});
});

test.describe('the rail marker still does its job', () => {
	// Guard against "fixing" the bug by disabling the feature. The rail must
	// still scroll its OWN box to keep the active item visible.
	test('an overflowing rail self-scrolls without moving the document', async ({ page }) => {
		// A short viewport is what forces the 16-item Terms index to overflow;
		// at 900px tall it fits, and the code path under test never runs.
		await page.setViewportSize({ width: 1440, height: 420 });
		await page.goto('/terms/', { waitUntil: 'networkidle' });

		const overflowing = await page.evaluate(() => {
			const box = document.querySelector('.section-rail-inner');
			return !!box && box.scrollHeight > box.clientHeight + 1;
		});
		expect(overflowing, 'expected the rail index to overflow at this height').toBe(true);

		const railTops: number[] = [];
		const pageTops: number[] = [];
		for (let i = 0; i < 40; i++) {
			await page.mouse.wheel(0, STEP);
			await page.waitForTimeout(110);
			const sample = await page.evaluate(() => ({
				rail: Math.round(document.querySelector('.section-rail-inner')!.scrollTop),
				page: Math.round(window.scrollY)
			}));
			railTops.push(sample.rail);
			pageTops.push(sample.page);
		}

		// The rail moved...
		const railTravel = Math.max(...railTops) - Math.min(...railTops);
		expect(railTravel, 'the rail never scrolled its own box').toBeGreaterThan(0);

		// ...and the document never went backwards while it did.
		const backwards = pageTops.filter((y, i) => i > 0 && y < pageTops[i - 1] - 2);
		expect(backwards, 'the rail moved the document instead of itself').toEqual([]);
	});

	test('the active marker tracks the heading being read', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/terms/', { waitUntil: 'networkidle' });

		const marked = new Set<string>();
		for (let i = 0; i < 40; i++) {
			await page.mouse.wheel(0, 400);
			await page.waitForTimeout(100);
			const active = await page.evaluate(
				() => document.querySelector('.rail-index a.is-active')?.textContent?.trim() ?? null
			);
			if (active) marked.add(active);
		}

		// Several distinct sections should light up over a full-page scroll. An
		// exact count would be brittle; zero or one means the marker is dead.
		expect(marked.size, `only ${marked.size} section(s) ever marked active`).toBeGreaterThan(2);
	});

	test('a rail anchor click jumps to its heading', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/terms/', { waitUntil: 'networkidle' });

		await page.locator('.rail-index a').nth(3).click();
		await page.waitForTimeout(700);

		const { y, hash } = await page.evaluate(() => ({
			y: Math.round(window.scrollY),
			hash: location.hash
		}));
		expect(hash).not.toBe('');
		expect(y, 'the anchor did not move the page').toBeGreaterThan(0);

		// The heading it names should be at the top of the viewport, not just
		// anywhere on the page.
		const headingTop = await page.evaluate((h) => {
			const el = document.querySelector(h);
			return el ? Math.round(el.getBoundingClientRect().top) : null;
		}, hash);
		expect(headingTop).not.toBeNull();
		expect(Math.abs(headingTop!)).toBeLessThan(200);
	});
});
