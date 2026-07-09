<script lang="ts">
	import { site } from '$lib/site';
</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.description} />
</svelte:head>

<section class="hero">
	<p class="hero-eyebrow">Software Engineer · Virginia</p>
	<h1 class="hero-title">Software and web development for businesses and government.</h1>
	<p class="hero-lead">
		I'm Jared Howard, a software engineer. I build custom web applications, internal tools, and
		automated test suites — and I keep them running after launch.
	</p>
	<div class="hero-cta">
		<a class="btn btn-primary btn-arrow" href="/contact/">Start a project</a>
		<a class="btn btn-secondary" href="/capabilities/">Capabilities</a>
	</div>
</section>

<section class="streams">
	<h2>What I do</h2>
	<div class="stream-grid">
		<div class="stream-card">
			<span class="stream-tag">Commercial</span>
			<h3>For small businesses</h3>
			<p>
				Custom web apps, SaaS dashboards, e-commerce storefronts, and internal tools — designed,
				built, hosted, and maintained. Billed as project fees, retainers, or subscriptions.
			</p>
		</div>
		<div class="stream-card">
			<span class="stream-tag">Public sector</span>
			<h3>For government</h3>
			<p>
				Application development, systems integration, and test automation for public-sector work,
				under NAICS 541511, 541512, and 513210. See the
				<a href="/capabilities/">capability statement</a>.
			</p>
		</div>
	</div>
</section>

<section class="work">
	<h2>Selected work</h2>
	<div class="project-grid">
		{#each site.projects as project (project.repo)}
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
		{/each}
	</div>
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
