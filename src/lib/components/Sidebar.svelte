<script lang="ts">
	import { page } from '$app/stores';
	import { site } from '$lib/site';
</script>

<aside class="sidebar">
	<div class="sidebar-bio">
		<h1>{site.title}</h1>
		<p>{site.description}</p>
	</div>
	<nav class="sidebar-nav">
		<ul>
			{#each site.nav as item (item.href)}
				<li>
					<a href={item.href} class:active={$page.url.pathname === item.href}>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</aside>
