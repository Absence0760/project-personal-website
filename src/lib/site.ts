// Site-wide metadata — the SvelteKit equivalent of Zola's old config.toml.
// `url` is the production origin used for canonical links and the sitemap.

export interface NavLink {
	href: string;
	label: string;
}

export const site = {
	title: 'Jared Howard',
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
