<script lang="ts">
	import { page } from '$app/stores';
	import { site } from '$lib/site';
</script>

<aside class="sidebar">
	<a class="sidebar-brand" href="/" aria-label="{site.title} — home">
		<span class="sidebar-mark" aria-hidden="true">{site.initials}</span>
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
