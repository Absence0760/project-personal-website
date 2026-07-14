#!/usr/bin/env node
// Generate build/cv.pdf from the prerendered CV page, so the downloadable
// PDF can never drift from what /cv/ shows. Runs AFTER `pnpm build` (it
// reads ./build), via `pnpm build:pdf`. Requires the Playwright Chromium
// browser (`pnpm exec playwright install chromium`).
//
// How: serve ./build on an ephemeral localhost port (the prerendered HTML
// references absolute /_app/... asset paths, so file:// won't resolve them),
// print /cv/ to PDF with Chromium — page.pdf() applies the site's
// `@media print` styles (sidebar/footer/button hidden, print-only header
// shown) — and write the result next to the rest of the static output.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = path.join(rootDir, 'build');
const outPath = path.join(buildDir, 'cv.pdf');

if (!fs.existsSync(path.join(buildDir, 'cv', 'index.html'))) {
	console.error('build/cv/index.html not found — run `pnpm build` first.');
	process.exit(1);
}

const MIME = {
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'text/javascript',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.ico': 'image/x-icon',
	'.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
	const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
	let filePath = path.normalize(path.join(buildDir, urlPath));
	if (!filePath.startsWith(buildDir)) {
		res.writeHead(403).end();
		return;
	}
	if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
		filePath = path.join(filePath, 'index.html');
	}
	if (!fs.existsSync(filePath)) {
		res.writeHead(404).end();
		return;
	}
	res.writeHead(200, { 'content-type': MIME[path.extname(filePath)] ?? 'application/octet-stream' });
	fs.createReadStream(filePath).pipe(res);
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();

let browser;
try {
	browser = await chromium.launch();
	const page = await browser.newPage({ colorScheme: 'light' });
	await page.goto(`http://127.0.0.1:${port}/cv/`, { waitUntil: 'networkidle' });
	await page.pdf({
		path: outPath,
		format: 'Letter',
		margin: { top: '0.75in', right: '0.85in', bottom: '0.75in', left: '0.85in' },
		printBackground: true
	});
	const kb = Math.round(fs.statSync(outPath).size / 1024);
	console.log(`Wrote ${path.relative(rootDir, outPath)} (${kb} KB).`);
} finally {
	await browser?.close();
	server.close();
}
