<script lang="ts">
	import { site } from '$lib/site';

	const year = new Date().getFullYear();
</script>

<footer>
	<ul class="footer-links">
		{#each site.footer as item (item.href)}
			<li><a href={item.href}>{item.label}</a></li>
		{/each}
	</ul>
	<p>&copy; {year} {site.title}</p>
</footer>
