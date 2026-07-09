<script lang="ts">
	import { page } from '$app/stores';
	import { site } from '$lib/site';
</script>

<aside class="sidebar">
	<a class="sidebar-brand" href="/" aria-label="{site.title} — home">
		<span class="sidebar-mark" aria-hidden="true">
			<svg
				viewBox="0 0 512 512"
				fill="none"
				stroke="#fff"
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
		<span class="sidebar-brand-text">
			<span class="sidebar-name">{site.title}</span>
			<span class="sidebar-role">{site.role}</span>
		</span>
	</a>
	<p class="sidebar-bio">{site.description}</p>
	<nav class="sidebar-nav" aria-label="Primary">
		<ul>
			{#each site.nav as item (item.href)}
				<li>
					<a
						href={item.href}
						class:active={$page.url.pathname === item.href}
						aria-current={$page.url.pathname === item.href ? 'page' : undefined}
					>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</aside>
