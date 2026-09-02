/** The vertical extent of a box, in viewport coordinates. */
export interface Extent {
	top: number;
	bottom: number;
}

/**
 * How far the section rail's own scroll box must move to bring `link` fully
 * inside `box`. Negative scrolls the box up, positive down, `0` means the link
 * is already visible and nothing should move.
 *
 * This exists because `Element.scrollIntoView()` cannot be used here. It scrolls
 * *every* scrollable ancestor of the element, the document included — so the
 * rail marking its active item would yank the page the reader was scrolling.
 * With `html { scroll-behavior: smooth }` that yank is animated, which is what
 * made the interior pages impossible to scroll: each new heading activated the
 * next rail link, which scrolled the document back up toward it, which
 * re-activated the previous heading. The reader was held in a loop.
 *
 * Working in deltas keeps the caller honest: the only thing it can act on is
 * `box.scrollTop`. The document scroller is not reachable from here.
 */
export function railScrollDelta(box: Extent, link: Extent): number {
	if (link.top < box.top) return link.top - box.top;
	if (link.bottom > box.bottom) return link.bottom - box.bottom;
	return 0;
}
