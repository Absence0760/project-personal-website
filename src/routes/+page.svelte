<script lang="ts">
	import { site } from '$lib/site';
	import { reveal } from '$lib/reveal';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import LandingFooter from '$lib/components/LandingFooter.svelte';
	import HeroRibbon from '$lib/components/HeroRibbon.svelte';
	import WorkRow from '$lib/components/WorkRow.svelte';
	import Icon from '$lib/components/Icon.svelte';

	const featured = site.projects.filter((project) => project.featured);
</script>

<svelte:head>
	<title>{site.title} — {site.role}</title>
	<meta name="description" content={site.description} />
</svelte:head>

<SiteHeader />

<main class="landing">
	<!-- ── Hero ─────────────────────────────────────────────────
	     Above the fold, so nothing here waits on an IntersectionObserver:
	     the entrance is a pure-CSS sequence (see "Hero entrance" in app.css)
	     that has settled by 1080ms. -->
	<section class="hero" aria-labelledby="hero-title">
		<div class="hero-figure"><HeroRibbon /></div>

		<div class="hero-copy">
			<p class="eyebrow hero-in hero-in-eyebrow">
				<span class="eyebrow-dot" aria-hidden="true"></span>
				<span>{site.role} · Virginia</span>
			</p>

			<h1 class="hero-title hero-in hero-in-title" id="hero-title">
				Software and web development for <em class="hero-accent">businesses</em> and
				<em class="hero-accent">government</em>.
			</h1>

			<p class="hero-lead hero-in hero-in-lead">
				I build custom applications, internal tools, and automated test suites that are reliable,
				maintainable, and built to last.
			</p>

			<div class="hero-actions">
				<a class="button button-primary hero-in hero-in-cta1" href="/contact/">
					<span>Start a project</span>
					<Icon name="arrow" size={17} class="icon-nudge" />
				</a>
				<a class="button button-outline hero-in hero-in-cta2" href="/capabilities/">Capabilities</a>
			</div>
		</div>
	</section>

	<!-- ── What I do ────────────────────────────────────────── -->
	<section class="band" aria-labelledby="streams-label">
		<div class="band-head" data-reveal use:reveal={{}}>
			<h2 class="band-label" id="streams-label">What I do</h2>
			<span class="band-rule" aria-hidden="true"></span>
		</div>

		<div class="stream-row">
			<article class="stream-card" data-reveal use:reveal={{ index: 0 }}>
				<span class="stream-icon" aria-hidden="true"><Icon name="business" size={26} /></span>
				<div class="stream-text">
					<h3>For small businesses</h3>
					<p>
						Custom web apps, SaaS dashboards, e-commerce storefronts and internal tools — designed,
						built, hosted and maintained. Billed as a project, a retainer or a subscription.
					</p>
				</div>
				<a class="card-link" href="/services/">
					<span>Learn more</span>
					<Icon name="arrow" size={16} class="icon-nudge" />
				</a>
			</article>

			<article class="stream-card" data-reveal use:reveal={{ index: 1 }}>
				<span class="stream-icon" aria-hidden="true"><Icon name="government" size={26} /></span>
				<div class="stream-text">
					<h3>For government</h3>
					<p>
						Application development, systems integration and test automation for public-sector
						work, under NAICS 541511, 541512 and 513210.
					</p>
				</div>
				<a class="card-link" href="/capabilities/">
					<span>Learn more</span>
					<Icon name="arrow" size={16} class="icon-nudge" />
				</a>
			</article>
		</div>
	</section>

	<!-- ── Selected work ────────────────────────────────────── -->
	<section class="band" aria-labelledby="work-label">
		<div class="band-head" data-reveal use:reveal={{}}>
			<h2 class="band-label" id="work-label">Selected work</h2>
			<span class="band-rule" aria-hidden="true"></span>
			<a class="band-action" href={site.github} target="_blank" rel="noopener noreferrer">
				<span>View all work</span>
				<Icon name="arrow" size={15} class="icon-nudge" />
			</a>
		</div>

		<WorkRow projects={featured} />
	</section>

	<!-- ── About ────────────────────────────────────────────── -->
	<section class="band" aria-labelledby="about-label">
		<div class="band-head" data-reveal use:reveal={{}}>
			<h2 class="band-label" id="about-label">About</h2>
			<span class="band-rule" aria-hidden="true"></span>
			<a class="band-action" href="/contact/">
				<span>Get in touch</span>
				<Icon name="arrow" size={15} class="icon-nudge" />
			</a>
		</div>

		<p class="about-copy" data-reveal use:reveal={{}}>
			I'm based in Virginia and work as a QA-minded software engineer, building and maintaining
			automated test suites alongside the applications they support. My <a href="/cv/">CV</a> has the
			full background, and my
			<a href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a> has the code.
		</p>
	</section>
</main>

<LandingFooter />
