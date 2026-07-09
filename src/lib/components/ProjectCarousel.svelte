<script lang="ts">
	import { onMount } from 'svelte';
	import type { Project } from '$lib/site';

	let { projects }: { projects: readonly Project[] } = $props();

	// Progressive enhancement: the server renders every card (see the
	// :not(.is-live) grid fallback in app.css), so no-JS visitors get the full
	// list. `mounted` flips on the client and turns the grid into a slideshow.
	let mounted = $state(false);
	let index = $state(0);
	let paused = $state(false);
	let reduceMotion = $state(false);

	const count = $derived(projects.length);
	const go = (i: number) => (index = ((i % count) + count) % count);

	onMount(() => {
		mounted = true;
		reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	// Auto-advance — paused on hover/focus and when the visitor prefers reduced motion.
	$effect(() => {
		if (!mounted || paused || reduceMotion || count < 2) return;
		const id = setInterval(() => go(index + 1), 5000);
		return () => clearInterval(id);
	});

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowRight') { go(index + 1); event.preventDefault(); }
		else if (event.key === 'ArrowLeft') { go(index - 1); event.preventDefault(); }
	}
</script>

<!-- Pause-on-hover/focus and arrow-key nav enhance the focusable button controls
     below; the container itself is a presentational wrapper. -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="carousel"
	class:is-live={mounted}
	role="group"
	aria-roledescription="carousel"
	aria-label="Selected work"
	onmouseenter={() => (paused = true)}
	onmouseleave={() => (paused = false)}
	onfocusin={() => (paused = true)}
	onfocusout={() => (paused = false)}
	onkeydown={onKeydown}
>
	<div class="carousel-track" style:transform={mounted ? `translateX(-${index * 100}%)` : undefined}>
		{#each projects as project, i (project.repo)}
			<div
				class="carousel-slide"
				role="group"
				aria-roledescription="slide"
				aria-label="{i + 1} of {count}: {project.name}"
				inert={mounted && i !== index}
			>
				<a
					class="project-card"
					href={project.repo}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="{project.name} — view the repository on GitHub"
				>
					<div class="project-head">
						<h3>{project.name}</h3>
						<svg
							class="project-gh"
							viewBox="0 0 16 16"
							width="18"
							height="18"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 012-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"
							/>
						</svg>
					</div>
					<p>{project.blurb}</p>
					<ul class="project-tech">
						{#each project.tech as item (item)}
							<li>{item}</li>
						{/each}
					</ul>
				</a>
			</div>
		{/each}
	</div>

	{#if mounted && count > 1}
		<div class="carousel-controls">
			<button class="carousel-arrow" type="button" onclick={() => go(index - 1)} aria-label="Previous project">
				<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" /></svg>
			</button>
			<div class="carousel-dots">
				{#each projects as project, i (project.repo)}
					<button
						class="carousel-dot"
						class:active={i === index}
						type="button"
						onclick={() => go(i)}
						aria-label="Show {project.name}"
						aria-current={i === index ? 'true' : undefined}
					></button>
				{/each}
			</div>
			<button class="carousel-arrow" type="button" onclick={() => go(index + 1)} aria-label="Next project">
				<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" /></svg>
			</button>
		</div>
	{/if}
</div>
