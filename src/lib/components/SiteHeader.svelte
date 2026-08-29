<script lang="ts">
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import { site } from '$lib/site';
	import Monogram from './Monogram.svelte';
	import Icon from './Icon.svelte';

	// Landing-page masthead.
	//
	// Two compositions, and the menu button belongs to only one of them:
	//   · ≥1080px — the lockup band sits above a full-width nav rail. The rail
	//     is the navigation; the menu button is hidden, because a control that
	//     duplicates visible navigation is noise.
	//   · <1080px — the button appears. Between 720 and 1080 the rail is still
	//     there and the sheet is additive (it also carries the email address and
	//     GitHub); below 720 the rail is gone and the sheet *is* the navigation.
	let open = $state(false);
	let scrolled = $state(false);
	let panel = $state<HTMLElement | null>(null);
	let trigger = $state<HTMLButtonElement | null>(null);

	const current = $derived($page.url.pathname);
	const activeIndex = $derived(Math.max(0, site.nav.findIndex((item) => item.href === current)));

	// The rail's active marker is a single dot that slides to whichever item the
	// pointer is over and returns to the current page on leave — so the mark
	// tracks the eye instead of sitting still. It needs measurement, so it is
	// mount-gated: until `dotReady`, the CSS dot on the active link is what
	// shows, which is also what a visitor without JavaScript keeps.
	let rail = $state<HTMLElement | null>(null);
	let dotX = $state(0);
	let dotReady = $state(false);

	function moveDot(index: number) {
		const link = rail?.querySelectorAll<HTMLElement>('.masthead-rail a')[index];
		if (!link || !rail) return;
		const box = link.getBoundingClientRect();
		dotX = box.left - rail.getBoundingClientRect().left + box.width / 2;
		dotReady = true;
	}

	$effect(() => {
		const node = rail;
		if (!node) return;
		const index = activeIndex;
		const settle = () => moveDot(index);
		settle();
		const resize = new ResizeObserver(settle);
		resize.observe(node);
		return () => resize.disconnect();
	});

	function close() {
		if (!open) return;
		open = false;
		trigger?.focus();
	}

	afterNavigate(() => (open = false));

	// The masthead grows a hairline and a backdrop once the hero slides under it.
	$effect(() => {
		const onScroll = () => (scrolled = window.scrollY > 24);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	// While the sheet is open: the page behind it is inert and frozen at its
	// scroll position, Tab is trapped inside the sheet, and Escape leaves.
	// Everything is torn down — and the scroll position restored — on close.
	$effect(() => {
		if (!open) return;

		const behind = Array.from(
			document.querySelectorAll<HTMLElement>('.landing, .landing-footer')
		);
		for (const element of behind) element.inert = true;

		// position:fixed rather than overflow:hidden — iOS Safari ignores the
		// latter on <html> and scrolls the page behind the sheet anyway.
		const y = window.scrollY;
		const body = document.body;
		const prior = { position: body.style.position, top: body.style.top, width: body.style.width };
		body.style.position = 'fixed';
		body.style.top = `-${y}px`;
		body.style.width = '100%';

		panel?.querySelector<HTMLElement>('a, button')?.focus();

		function onKeydown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				event.preventDefault();
				close();
				return;
			}
			if (event.key !== 'Tab' || !panel) return;

			const focusable = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
			if (focusable.length === 0) return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}

		document.addEventListener('keydown', onKeydown);

		return () => {
			document.removeEventListener('keydown', onKeydown);
			for (const element of behind) element.inert = false;
			body.style.position = prior.position;
			body.style.top = prior.top;
			body.style.width = prior.width;
			window.scrollTo(0, y);
		};
	});
</script>

<header class="masthead" class:is-scrolled={scrolled}>
	<div class="masthead-band">
		<a class="lockup lockup-in" href="/" aria-label="{site.title} — home">
			<Monogram size={40} />
			<span class="lockup-text">
				<span class="lockup-name">{site.title}</span>
				<span class="lockup-role">{site.role}</span>
			</span>
		</a>

		<button
			bind:this={trigger}
			class="menu-button"
			type="button"
			aria-expanded={open}
			aria-controls="site-menu"
			aria-label={open ? 'Close menu' : 'Open menu'}
			onclick={() => (open ? close() : (open = true))}
		>
			<span class="menu-button-bars" class:is-open={open} aria-hidden="true">
				<span></span><span></span><span></span>
			</span>
		</button>
	</div>

	<nav
		bind:this={rail}
		class="masthead-rail rail-in"
		class:has-dot={dotReady}
		aria-label="Primary"
		onpointerleave={() => moveDot(activeIndex)}
	>
		<ul>
			{#each site.nav as item, i (item.href)}
				<li>
					<a
						href={item.href}
						class:is-active={current === item.href}
						aria-current={current === item.href ? 'page' : undefined}
						onpointerenter={() => moveDot(i)}
					>
						<span>{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>
		<span class="rail-dot" class:is-ready={dotReady} style:--dot-x="{dotX}px" aria-hidden="true"
		></span>
	</nav>

	<span class="masthead-hairline hairline-in" aria-hidden="true"></span>
</header>

<!-- Nav sheet. A sibling of the masthead so its full-viewport fill isn't
     trapped in the header's stacking context. -->
<div
	bind:this={panel}
	id="site-menu"
	class="sheet"
	class:is-open={open}
	inert={!open}
	role="dialog"
	aria-modal="true"
	aria-label="Site menu"
>
	<button class="sheet-close" type="button" onclick={close} aria-label="Close menu">
		<Icon name="close" size={20} />
	</button>

	<nav aria-label="Menu">
		<ul class="sheet-nav">
			{#each site.nav as item, i (item.href)}
				<li style:--row="{i}">
					<a
						href={item.href}
						class:is-active={current === item.href}
						aria-current={current === item.href ? 'page' : undefined}
						onclick={() => (open = false)}
					>
						<span class="sheet-label">{item.label}</span>
						<span class="sheet-index">{String(i + 1).padStart(2, '0')}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="sheet-foot" style:--row={site.nav.length}>
		<a href="mailto:{site.email}"><Icon name="mail" size={16} /><span>{site.email}</span></a>
		<a href={site.github} target="_blank" rel="noopener noreferrer">
			<Icon name="github" size={16} /><span>GitHub</span>
		</a>
	</div>
</div>
