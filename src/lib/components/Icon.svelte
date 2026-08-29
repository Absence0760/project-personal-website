<script lang="ts">
	// Every glyph the landing page uses, hand-authored and inlined — the site
	// loads no icon font or third-party sprite (see CLAUDE.md → Privacy rule).
	type Name =
		| 'arrow'
		| 'github'
		| 'mail'
		| 'business'
		| 'government'
		| 'external'
		| 'close';

	let {
		name,
		size = 16,
		class: className = ''
	}: { name: Name; size?: number; class?: string } = $props();
</script>

<svg
	class="icon {className}"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	focusable="false"
>
	{#if name === 'arrow'}
		<path d="M4 12h15" />
		<path d="m13 6 6 6-6 6" />
	{:else if name === 'external'}
		<path d="M7 17 17 7" />
		<path d="M8 7h9v9" />
	{:else if name === 'github'}
		<!-- Solid mark: the GitHub logo reads as a silhouette, not a stroke. -->
		<path
			fill="currentColor"
			stroke="none"
			d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.53.1.72-.23.72-.5v-1.95c-2.64.57-3.32-.64-3.53-1.23-.12-.3-.62-1.23-1.06-1.48-.36-.2-.88-.67-.01-.69.82-.01 1.4.75 1.6 1.06.93 1.57 2.42 1.13 3.02.86.09-.68.36-1.13.66-1.4-2.33-.26-4.77-1.17-4.77-5.18 0-1.14.41-2.08 1.07-2.82-.11-.26-.47-1.34.1-2.78 0 0 .87-.28 2.86 1.07a9.7 9.7 0 0 1 5.2 0c1.99-1.35 2.86-1.07 2.86-1.07.57 1.44.21 2.52.1 2.78.67.74 1.07 1.67 1.07 2.82 0 4.03-2.45 4.92-4.79 5.18.38.33.71.96.71 1.94v2.87c0 .28.19.61.72.5A10.5 10.5 0 0 0 12 1.5Z"
		/>
	{:else if name === 'mail'}
		<rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
		<path d="m3.5 7 7.34 5.3a2 2 0 0 0 2.32 0L20.5 7" />
	{:else if name === 'business'}
		<!-- Office block: the small-business stream. -->
		<path d="M3.5 20.5h17" />
		<path d="M5.5 20.5V5a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 1 14.5 5v15.5" />
		<path d="M14.5 20.5V10h3.2a1.3 1.3 0 0 1 1.3 1.3v9.2" />
		<path d="M8.3 7.2h3.4M8.3 10.6h3.4M8.3 14h3.4M8.3 17.4h3.4" />
	{:else if name === 'government'}
		<!-- Pediment + colonnade: the public-sector stream. -->
		<path d="M2.8 20.5h18.4" />
		<path d="M12 2.8 3.6 7.4h16.8L12 2.8Z" />
		<path d="M4.8 17.6V9.6M9.6 17.6V9.6M14.4 17.6V9.6M19.2 17.6V9.6" />
		<path d="M3.6 17.6h16.8" />
	{:else if name === 'close'}
		<path stroke-width="2" d="m6 6 12 12M18 6 6 18" />
	{/if}
</svg>
