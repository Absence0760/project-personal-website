import { describe, it, expect } from 'vitest';
import { site } from './site';

describe('site metadata', () => {
	it('has an https apex URL with no trailing slash', () => {
		expect(site.url).toBe('https://jaredhoward.com');
	});

	it('lists routes as absolute, trailing-slash paths (home excepted)', () => {
		for (const route of site.routes) {
			expect(route.startsWith('/')).toBe(true);
			if (route !== '/') {
				expect(route.endsWith('/')).toBe(true);
			}
		}
	});

	it('has no duplicate routes', () => {
		expect(new Set(site.routes).size).toBe(site.routes.length);
	});

	it('every sidebar nav target is a known route', () => {
		for (const link of site.nav) {
			expect(site.routes).toContain(link.href);
		}
	});

	it('every footer link target is a known route', () => {
		for (const link of site.footer) {
			expect(site.routes).toContain(link.href);
		}
	});
});
