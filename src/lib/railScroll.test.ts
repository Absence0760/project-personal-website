import { describe, it, expect } from 'vitest';
import { railScrollDelta } from './railScroll';

// The rail's active marker used `link.scrollIntoView({ block: 'nearest' })`,
// which scrolls every scrollable ancestor — the document included. On the eight
// pages carrying a rail that made downward scrolling impossible: each heading
// the reader reached activated the next rail link, which pulled the document
// back up toward the rail, which re-activated the heading before it.
//
// `railScrollDelta` is the replacement, and the property that matters is that
// it can only ever describe a move of the rail's own box. The caller adds the
// result to `box.scrollTop` and has no other lever.

const box = { top: 100, bottom: 400 };

describe('railScrollDelta', () => {
	it('is 0 when the link already sits inside the box', () => {
		expect(railScrollDelta(box, { top: 150, bottom: 200 })).toBe(0);
	});

	it('is 0 when the link exactly fills the box', () => {
		expect(railScrollDelta(box, { top: 100, bottom: 400 })).toBe(0);
	});

	it('is 0 at the edges — flush top and flush bottom both count as visible', () => {
		expect(railScrollDelta(box, { top: 100, bottom: 140 })).toBe(0);
		expect(railScrollDelta(box, { top: 360, bottom: 400 })).toBe(0);
	});

	it('is negative when the link is above the box, by exactly the shortfall', () => {
		expect(railScrollDelta(box, { top: 60, bottom: 90 })).toBe(-40);
	});

	it('is positive when the link is below the box, by exactly the overhang', () => {
		expect(railScrollDelta(box, { top: 420, bottom: 450 })).toBe(50);
	});

	it('moves the minimum distance that makes the link visible', () => {
		// Scrolling up by 40 puts the link's top flush with the box's top; any
		// less leaves it clipped, any more is wasted travel the reader sees.
		const link = { top: 60, bottom: 90 };
		const delta = railScrollDelta(box, link);
		const moved = { top: link.top - delta, bottom: link.bottom - delta };
		expect(moved.top).toBe(box.top);
		expect(railScrollDelta(box, moved)).toBe(0);
	});

	it('prefers the top edge when the link is taller than the box', () => {
		// Nothing can bring it fully inside, so align its top and let the
		// overflow fall off the bottom rather than hiding the label.
		expect(railScrollDelta(box, { top: 50, bottom: 900 })).toBe(-50);
	});

	it('never reports a move for a link that is already visible, at any offset', () => {
		// The loop the old code created came from repeatedly "correcting" a
		// position that needed no correction. Sweep the whole visible range.
		for (let top = box.top; top <= box.bottom - 20; top += 5) {
			expect(railScrollDelta(box, { top, bottom: top + 20 })).toBe(0);
		}
	});
});
