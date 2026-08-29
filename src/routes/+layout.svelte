<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onNavigate } from '$app/navigation';
	import { site } from '$lib/site';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();

	// The landing page is its own composition — a full-bleed header, hero and
	// footer card (see docs/design-system.md → "Landing page"). Every other
	// route keeps the sidebar rail + centred content shell.
	const isLanding = $derived($page.url.pathname === '/');

	// Reproduce the old transitions.js 220ms cross-fade via the View
	// Transitions API. Progressive enhancement: browsers without the API (or
	// users who prefer reduced motion) simply hard-swap. SvelteKit's client
	// router only intercepts internal links, so external/mailto/hash links are
	// unaffected — no manual opt-out needed.
	onNavigate((navigation) => {
		if (typeof document === 'undefined') return;
		// View Transitions API isn't in the baseline DOM lib types yet.
		const doc = document as Document & {
			startViewTransition?: (callback: () => Promise<void> | void) => void;
		};
		if (!doc.startViewTransition) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		return new Promise((resolve) => {
			doc.startViewTransition!(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="canonical" href={site.url + $page.url.pathname} />
</svelte:head>

{#if isLanding}
	{@render children()}
{:else}
	<main>
		<div class="home-layout">
			<Sidebar />
			<div class="page-content">
				{@render children()}
			</div>
		</div>
	</main>

	<Footer />
{/if}
