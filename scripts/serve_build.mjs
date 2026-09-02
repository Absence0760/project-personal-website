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

const server = http.createServer((req, res) => {
	const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);

	// Contain everything to build/ — a path that escapes it is a 404, not a read.
	let file = path.join(ROOT, urlPath);
	if (urlPath.endsWith('/')) file = path.join(file, 'index.html');
	const resolved = path.resolve(file);

	const missing =
		!resolved.startsWith(path.resolve(ROOT)) ||
		!fs.existsSync(resolved) ||
		fs.statSync(resolved).isDirectory();

	if (missing) {
		const notFound = path.join(ROOT, '404.html');
		res.writeHead(404, { 'Content-Type': TYPES['.html'] });
		if (fs.existsSync(notFound)) return fs.createReadStream(notFound).pipe(res);
		return res.end('Not found');
	}

	res.writeHead(200, { 'Content-Type': TYPES[path.extname(resolved)] ?? 'application/octet-stream' });
	fs.createReadStream(resolved).pipe(res);
});

server.listen(PORT, () => console.log(`serve_build: ${ROOT} on http://localhost:${PORT}`));
