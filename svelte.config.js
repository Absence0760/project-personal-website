import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],

	kit: {
		// Pure static output → ./build (default dir). No SSR, no backend.
		adapter: adapter(),
		// Apex domain (jaredhoward.com) → base stays ''. BASE_PATH is only
		// wired up so a subpath deploy is possible without editing this file.
		paths: {
			base: process.env.BASE_PATH || ''
		},
		prerender: {
			// '*' crawls every linked page; the sitemap endpoint is unlinked,
			// so name it explicitly.
			entries: ['*', '/sitemap.xml']
		}
	}
};

export default config;
