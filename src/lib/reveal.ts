// Scroll-reveal action for the landing page's below-the-fold sections.
//
// The hidden state is CSS, gated on the `js` class that `app.html` sets inline
// before first paint: `.js [data-reveal] { opacity: 0 }`. So a visitor without
// JavaScript never has anything hidden from them, and a visitor with it never
// sees a visible→hidden flash. This action only ever adds `.is-in`.
//
// Above-the-fold content is deliberately NOT routed through here — the hero
// runs a pure-CSS entrance and never waits on an observer.

let observer: IntersectionObserver | undefined;

function shared(): IntersectionObserver {
	observer ??= new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add('is-in');
				// Reveals are one-way: never re-fire on scroll-up.
				observer!.unobserve(entry.target);
			}
		},
		{ rootMargin: '0px 0px -12% 0px', threshold: 0.15 }
	);
	return observer;
}

export interface RevealOptions {
	/**
	 * Position within a staggered group. Capped at 2, so a group's stagger can
	 * never exceed 140ms however many items it holds.
	 */
	index?: number;
	/**
	 * Below this viewport width, mark the element revealed immediately instead
	 * of observing it.
	 *
	 * For content that sits inside a horizontal snap-scroller. The shared
	 * observer insets only the bottom edge, which assumes vertical runway — an
	 * element approaches gradually and the fade plays *during* the approach. A
	 * card clipped by its rail has no runway: it is not intersecting at all
	 * until it is swiped in, so vertical scrolling alone never reveals it (it
	 * sits blank indefinitely) and a swipe reveals it only *after* it has
	 * arrived, which reads as slow loading rather than as an entrance. The rail
	 * already has an affordance — the peeking next card and the progress track
	 * — so it does not need an entrance too.
	 */
	staticBelow?: number;
}

/** Stagger step, in seconds. Kept in sync with --reveal-step in app.css. */
const STEP = 0.07;

export function reveal(node: HTMLElement, options: RevealOptions = {}) {
	const step = Math.min(options.index ?? 0, 2) * STEP;
	if (step) node.style.setProperty('--reveal-delay', `${step.toFixed(2)}s`);

	const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
	// 0.02 below the breakpoint, so this and the `max-width: 719px` rules in
	// app.css switch at the same place rather than one pixel apart.
	const narrow = options.staticBelow
		? window.matchMedia(`(max-width: ${options.staticBelow - 0.02}px)`)
		: null;

	// Reduced motion removes the transition outright rather than shortening it;
	// the element is simply marked revealed. Same for a viewport below
	// `staticBelow`. Both are subscribed to `change`, so toggling the OS setting
	// or crossing the breakpoint takes effect without a reload.
	function sync() {
		if (calm.matches || narrow?.matches) {
			node.classList.add('is-in');
			observer?.unobserve(node);
		} else if (!node.classList.contains('is-in')) {
			shared().observe(node);
		}
	}

	sync();
	calm.addEventListener('change', sync);
	narrow?.addEventListener('change', sync);

	return {
		destroy() {
			calm.removeEventListener('change', sync);
			narrow?.removeEventListener('change', sync);
			observer?.unobserve(node);
		}
	};
}
