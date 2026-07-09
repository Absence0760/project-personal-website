<script lang="ts">
	import { site } from '$lib/site';
</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.description} />
</svelte:head>

<section class="hero">
	<h1 class="hero-title">Software and web development for businesses and government.</h1>
	<p class="hero-lead">
		I'm Jared Howard, a software engineer. I build custom web applications, internal tools, and
		automated test suites — and I keep them running after launch.
	</p>
	<div class="hero-cta">
		<a class="btn btn-primary" href="/contact/">Start a project</a>
		<a class="btn btn-secondary" href="/capabilities/">Capabilities</a>
	</div>
</section>

<section class="streams">
	<h2>What I do</h2>
	<div class="stream-grid">
		<div class="stream-card">
			<h3>For small businesses</h3>
			<p>
				Custom web apps, SaaS dashboards, e-commerce storefronts, and internal tools — designed,
				built, hosted, and maintained. Billed as project fees, retainers, or subscriptions.
			</p>
		</div>
		<div class="stream-card">
			<h3>For government</h3>
			<p>
				Application development, systems integration, and test automation for public-sector work,
				under NAICS 541511, 541512, and 513210. See the
				<a href="/capabilities/">capability statement</a>.
			</p>
		</div>
	</div>
</section>

<section class="capabilities-strip">
	<h2>Tools I work with</h2>
	<ul class="tech-tags">
		<li>JavaScript / TypeScript</li>
		<li>Python</li>
		<li>Cypress &amp; Playwright</li>
		<li>AWS</li>
		<li>Terraform</li>
		<li>CI/CD</li>
	</ul>
</section>

<section class="home-about">
	<h2>About</h2>
	<p>
		I'm based in Virginia and work as a software development engineer in test at Corpay, building
		and maintaining automated test suites. Alongside that I run an independent development practice.
		My <a href="/cv/">CV</a> has the full background, and my code is on
		<a href="https://github.com/Absence0760" rel="noopener">GitHub</a>.
	</p>
	<p class="home-cta-line">
		<a href="/contact/">Get in touch</a> to talk about a project.
	</p>
</section>
