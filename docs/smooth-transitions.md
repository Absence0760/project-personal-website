# Smooth page transitions

The site cross-fades between pages on navigation (~220 ms). Under SvelteKit
this is two pieces, both progressive enhancement:

1. **Soft navigation is built in.** SvelteKit's client-side router intercepts
   internal link clicks and swaps the page without a full reload. It only
   intercepts internal links, so `mailto:`, external, and hash links are
   untouched — no manual opt-out list to maintain.
2. **The cross-fade** is the [View Transitions API], wired up in
   `src/routes/+layout.svelte` via `onNavigate`:

```js
onNavigate((navigation) => {
  if (typeof document === 'undefined') return;
  const doc = document; // View Transitions API isn't in baseline DOM types yet
  if (!doc.startViewTransition) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  return new Promise((resolve) => {
    doc.startViewTransition(async () => {
      resolve();
      await navigation.complete;
    });
  });
});
```

The fade timing lives in `src/app.css` as `::view-transition-old(root)` /
`::view-transition-new(root)` keyframes (220 ms), with a
`prefers-reduced-motion` guard that disables the animation.

Browsers without `document.startViewTransition` simply hard-swap the page —
the site stays fully functional. This replaces the old hand-rolled
`static/js/transitions.js` (fetch + DOMParser + `history.pushState`), which
SvelteKit's router now handles natively.

[View Transitions API]: https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
