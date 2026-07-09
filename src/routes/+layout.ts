// Prerender the whole route tree → pure static output (adapter-static).
export const prerender = true;

// Match Zola's pretty URLs: every page is served as <route>/index.html and
// canonicalized to a trailing slash.
export const trailingSlash = 'always';
