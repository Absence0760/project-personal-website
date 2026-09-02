// Static server over ./build that mimics GitHub Pages, for the e2e suite.
//
// `vite preview` is not a substitute here. It answers an unknown URL with
// SvelteKit's own rendered error page, whereas Pages serves the static
// `build/404.html` — a different file, with different markup, and the one
// visitors actually get. The e2e suite exists to test the artefact we deploy,
// so it has to be served the way the host serves it:
//
//   · a directory path resolves to its index.html   (trailingSlash: 'always')
//   · anything unresolved returns build/404.html with a real 404 status
//   · everything else is a byte-for-byte static file
//
// The request path is never joined onto a filesystem path. The site is fully
// prerendered, so the set of servable files is fixed and known before the
// first request: it is enumerated once at startup into a URL → absolute-path
// map, and serving is a lookup in that map. A request for `/../../etc/passwd`
// is simply a key that isn't present, so there is no traversal to defend
// against and nothing for CodeQL's js/path-injection to flag — an earlier
// version did `path.join(ROOT, urlPath)` behind a `startsWith` containment
// check, which was safe but unverifiable by dataflow analysis.
//
// Port comes from PORT so playwright.config.ts owns the choice.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'build');
const PORT = Number(process.env.PORT ?? 4173);

const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.ico': 'image/x-icon',
	'.json': 'application/json',
	'.webmanifest': 'application/manifest+json',
	'.xml': 'application/xml',
	'.txt': 'text/plain',
	'.pdf': 'application/pdf'
};

if (!fs.existsSync(ROOT)) {
	console.error(`serve_build: ${ROOT} does not exist — run \`pnpm build\` first.`);
	process.exit(1);
}

/** Every file in build/, keyed by the URL path GitHub Pages would serve it at. */
function indexBuild(dir, urlPrefix, routes) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const absolute = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			indexBuild(absolute, `${urlPrefix}${entry.name}/`, routes);
		} else if (entry.name === 'index.html') {
			// build/work/index.html is served at /work/ — and at /work, which Pages
			// redirects; accepting both keeps a missing slash out of the results.
			routes.set(urlPrefix, absolute);
			if (urlPrefix.length > 1) routes.set(urlPrefix.slice(0, -1), absolute);
		} else {
			routes.set(`${urlPrefix}${entry.name}`, absolute);
		}
	}
	return routes;
}

const ROUTES = indexBuild(ROOT, '/', new Map());
const NOT_FOUND = ROUTES.get('/404.html');

const server = http.createServer((req, res) => {
	let requested = (req.url ?? '/').split('?')[0].split('#')[0];
	try {
		requested = decodeURIComponent(requested);
	} catch {
		// A malformed escape sequence is simply not a route we serve.
	}

	// A lookup, not a path construction: `file` can only ever be a value this
	// process put into ROUTES by walking build/ itself.
	const file = ROUTES.get(requested);

	if (file === undefined) {
		res.writeHead(404, { 'Content-Type': TYPES['.html'] });
		if (NOT_FOUND === undefined) return res.end('Not found');
		return fs.createReadStream(NOT_FOUND).pipe(res);
	}

	res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
	fs.createReadStream(file).pipe(res);
});

server.listen(PORT, () =>
	console.log(`serve_build: ${ROUTES.size} routes from ${ROOT} on http://localhost:${PORT}`)
);
