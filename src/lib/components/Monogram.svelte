<script lang="ts">
	// The JH ligature (see docs/design-system.md → "Brand assets"), inlined so
	// the mark is part of the document and can inherit motion/gradient state.
	let { size = 44 }: { size?: number } = $props();
</script>

<span class="monogram" style:--monogram-size="{size}px" aria-hidden="true">
	<svg
		viewBox="0 0 512 512"
		fill="none"
		stroke="currentColor"
		stroke-width="60"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<g transform="translate(21,6)">
			<path d="M210 172 V300 Q210 340 172 340 Q140 340 140 306" />
			<path d="M210 256 H330" />
			<path d="M330 172 V340" />
		</g>
	</svg>
</span>
