// Pointer spotlight for the landing page's card rows.
//
// One delegated listener per row rather than one per card, rAF-throttled, and
// writing only two custom properties — the highlight itself is a background
// gradient, so it costs no compositor layer and triggers no layout.
//
// Attached only for fine pointers that aren't asking for reduced motion, and
// re-evaluated on `change` so toggling either OS setting takes effect without
// a reload. When it isn't attached the gradient simply never paints.

export function spotlight(node: HTMLElement, selector: string) {
	const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
	const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

	let frame = 0;
	let attached = false;

	function onMove(event: PointerEvent) {
		if (frame) return;
		frame = requestAnimationFrame(() => {
			frame = 0;
			const card = (event.target as Element | null)?.closest<HTMLElement>(selector);
			if (!card) return;
			const box = card.getBoundingClientRect();
			card.style.setProperty('--mx', `${event.clientX - box.left}px`);
			card.style.setProperty('--my', `${event.clientY - box.top}px`);
		});
	}

	function onLeave() {
		for (const card of node.querySelectorAll<HTMLElement>(selector)) {
			card.style.removeProperty('--mx');
			card.style.removeProperty('--my');
		}
	}

	function sync() {
		const want = fine.matches && !calm.matches;
		if (want === attached) return;
		attached = want;
		if (want) {
			node.addEventListener('pointermove', onMove, { passive: true });
			node.addEventListener('pointerleave', onLeave);
		} else {
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
			onLeave();
		}
	}

	sync();
	fine.addEventListener('change', sync);
	calm.addEventListener('change', sync);

	return {
		destroy() {
			fine.removeEventListener('change', sync);
			calm.removeEventListener('change', sync);
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
			cancelAnimationFrame(frame);
		}
	};
}
