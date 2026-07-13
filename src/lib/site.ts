// Site-wide metadata — the SvelteKit equivalent of Zola's old config.toml.
// `url` is the production origin used for canonical links and the sitemap.

export interface NavLink {
	href: string;
	label: string;
}

export interface Project {
	name: string;
	repo: string;
	/** Live site, if the project has a public one. */
	url?: string;
	blurb: string;
	tech: readonly string[];
}

export const site = {
	title: 'Jared Howard',
	role: 'Software Engineer',
	description:
		'Custom web and software development for small businesses and government agencies.',
	url: 'https://jaredhoward.com',

	// Sidebar navigation (order matters).
	nav: [
		{ href: '/', label: 'Home' },
		{ href: '/services/', label: 'Services' },
		{ href: '/capabilities/', label: 'Capabilities' },
		{ href: '/cv/', label: 'CV' },
		{ href: '/contact/', label: 'Contact' }
	] satisfies NavLink[],

	// Selected public work shown on the home page (each links to its GitHub repo).
	projects: [
		{
			name: 'Flakey',
			repo: 'https://github.com/Absence0760/project-flakey',
			blurb:
				'Self-hosted, CI-agnostic test-reporting dashboard — ingests Cypress, Playwright, Jest, and pytest results with flaky-test detection and multi-tenant Postgres row-level security.',
			tech: ['SvelteKit', 'TypeScript', 'Node', 'PostgreSQL', 'Docker']
		},
		{
			name: 'Meryl Green Designs',
			repo: 'https://github.com/Absence0760/meryl-green-designs',
			url: 'https://merylgreendesigns.com',
			blurb:
				'E-commerce site for a design studio — gallery, PayFast checkout, and an owner-managed CMS. Serverless on AWS, provisioned end-to-end with Terraform.',
			tech: ['SvelteKit', 'Hono', 'AWS Lambda', 'Sanity CMS', 'Terraform']
		},
		{
			name: 'Account Payables',
			repo: 'https://github.com/Absence0760/project-account-payables',
			blurb:
				'Full-stack accounts-payable app — multi-tenant invoice intake and approvals behind a Python API and a SvelteKit front end.',
			tech: ['SvelteKit', 'FastAPI', 'Python', 'PostgreSQL']
		},
		{
			name: 'Cross-platform fitness app',
			repo: 'https://github.com/Absence0760/project-running',
			url: 'https://threkir.com',
			blurb:
				'Running, gym, and nutrition app — Flutter on iOS and Android with native Apple Watch and Wear OS companions, a SvelteKit web app, and a Supabase backend.',
			tech: ['Flutter', 'SwiftUI', 'SvelteKit', 'Supabase']
		},
		{
			name: 'disag',
			repo: 'https://github.com/Absence0760/project-disag',
			url: 'https://disag.jaredhoward.com',
			blurb:
				'Disaggregates monthly streamflow into daily flows — a Python port of a legacy Delphi/Pascal hydrology model, with a SvelteKit web app and cross-platform CLI.',
			tech: ['Python', 'SvelteKit', 'Terraform']
		},
		{
			name: 'Going Dark',
			repo: 'https://github.com/Absence0760/project-gonedark',
			blurb:
				'Mobile-first RTS/FPS hybrid — command camps, then possess a single unit and go dark. Pre-production design plus a custom Rust game engine.',
			tech: ['Rust', 'WGSL', 'Kotlin']
		}
	] satisfies Project[],

	// Footer legal/contact links.
	footer: [
		{ href: '/contact/', label: 'Contact' },
		{ href: '/terms/', label: 'Terms' },
		{ href: '/privacy/', label: 'Privacy' },
		{ href: '/refunds/', label: 'Refunds' }
	] satisfies NavLink[],

	// Every prerendered route, for the sitemap. Keep in sync with src/routes/.
	routes: [
		'/',
		'/services/',
		'/capabilities/',
		'/cv/',
		'/contact/',
		'/terms/',
		'/privacy/',
		'/refunds/'
	]
} as const;
