import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { reveal } from './reveal';

// The Vitest environment is `node` (see vitest.config.ts), so the handful of DOM
// surfaces `reveal` touches are stubbed here rather than pulling in jsdom for
// one module. What is under test is the decision — observe, or mark revealed
// immediately — not the browser's IntersectionObserver implementation.

interface FakeQuery {
	matches: boolean;
	listeners: Set<() => void>;
	addEventListener(type: string, fn: () => void): void;
	removeEventListener(type: string, fn: () => void): void;
	/** Flip the query and notify, the way a real resize or OS toggle would. */
	set(value: boolean): void;
}

function makeQuery(matches: boolean): FakeQuery {
	return {
		matches,
		listeners: new Set(),
		addEventListener(_type, fn) {
			this.listeners.add(fn);
		},
		removeEventListener(_type, fn) {
			this.listeners.delete(fn);
		},
		set(value) {
			this.matches = value;
			for (const fn of this.listeners) fn();
		}
	};
}

let queries: Map<string, FakeQuery>;
let observed: unknown[];
let unobserved: unknown[];

/** Minimal stand-in for the element the action is applied to. */
function makeNode() {
	const classes = new Set<string>();
	return {
		classList: {
			add: (c: string) => classes.add(c),
			contains: (c: string) => classes.has(c)
		},
		style: { setProperty: vi.fn() },
		_classes: classes
	} as unknown as HTMLElement & { _classes: Set<string> };
}

beforeEach(() => {
	queries = new Map();
	observed = [];
	unobserved = [];

	vi.stubGlobal('window', {
		matchMedia: (query: string) => {
			if (!queries.has(query)) queries.set(query, makeQuery(false));
			return queries.get(query)!;
		}
	});
	vi.stubGlobal(
		'IntersectionObserver',
		class {
			constructor(_cb: unknown, _opts: unknown) {}
			observe(node: unknown) {
				observed.push(node);
			}
			unobserve(node: unknown) {
				unobserved.push(node);
			}
		}
	);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

const CALM = '(prefers-reduced-motion: reduce)';
/** 0.02 below the 720px breakpoint — see the comment in reveal.ts. */
const NARROW = '(max-width: 719.98px)';

describe('reveal', () => {
	it('observes the node when nothing opts out', () => {
		const node = makeNode();
		reveal(node);
		expect(observed).toEqual([node]);
		expect(node._classes.has('is-in')).toBe(false);
	});

	it('does not register a width query unless staticBelow is given', () => {
		reveal(makeNode());
		expect(queries.has(NARROW)).toBe(false);
	});

	it('subtracts 0.02 so it switches with the CSS max-width rule', () => {
		reveal(makeNode(), { staticBelow: 720 });
		expect(queries.has(NARROW)).toBe(true);
	});

	it('marks the node revealed instead of observing it below staticBelow', () => {
		// Pre-arm the query so it already matches when the action runs, the way a
		// phone-width first paint would.
		queries.set(NARROW, makeQuery(true));
		const node = makeNode();
		reveal(node, { staticBelow: 720 });

		// This is the regression: the work cards live in a horizontal snap rail
		// below 720px, where the shared vertical observer never intersects them
		// and they sat blank indefinitely.
		expect(node._classes.has('is-in')).toBe(true);
		expect(observed).toEqual([]);
	});

	it('still short-circuits on reduced motion regardless of width', () => {
		queries.set(CALM, makeQuery(true));
		const node = makeNode();
		reveal(node, { staticBelow: 720 });
		expect(node._classes.has('is-in')).toBe(true);
		expect(observed).toEqual([]);
	});

	it('reveals when the viewport crosses below the breakpoint mid-session', () => {
		const node = makeNode();
		reveal(node, { staticBelow: 720 });
		expect(observed).toEqual([node]);

		queries.get(NARROW)!.set(true);
		expect(node._classes.has('is-in')).toBe(true);
	});

	it('does not re-observe an already-revealed node when widening back out', () => {
		queries.set(NARROW, makeQuery(true));
		const node = makeNode();
		reveal(node, { staticBelow: 720 });
		expect(node._classes.has('is-in')).toBe(true);

		// Widening must not hide it again — reveals are one-way.
		queries.get(NARROW)!.set(false);
		expect(observed).toEqual([]);
		expect(node._classes.has('is-in')).toBe(true);
	});

	it('drops both listeners on destroy', () => {
		const handle = reveal(makeNode(), { staticBelow: 720 });
		expect(queries.get(CALM)!.listeners.size).toBe(1);
		expect(queries.get(NARROW)!.listeners.size).toBe(1);

		handle.destroy();
		expect(queries.get(CALM)!.listeners.size).toBe(0);
		expect(queries.get(NARROW)!.listeners.size).toBe(0);
	});

	it('sets a staggered delay only for a non-zero index, capped at 2 steps', () => {
		const first = makeNode();
		reveal(first, { index: 0 });
		expect(first.style.setProperty).not.toHaveBeenCalled();

		const third = makeNode();
		reveal(third, { index: 2 });
		expect(third.style.setProperty).toHaveBeenCalledWith('--reveal-delay', '0.14s');

		const tenth = makeNode();
		reveal(tenth, { index: 9 });
		expect(tenth.style.setProperty).toHaveBeenCalledWith('--reveal-delay', '0.14s');
	});
});
