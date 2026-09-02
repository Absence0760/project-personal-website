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

## The shell is held out of the fade

`root` means the whole document. The masthead and the footer card are the same
elements on every route — the layout keeps them mounted across a navigation and
they never change — but an unnamed transition captured them in the root
snapshot anyway, so they faded out and back in on every click. A full-width
fade of the entire page including the masthead is precisely what a browser does
on a real page load, so **navigation read as a full refresh** even though the
router never refetches a document.

Two lines in `app.css` fix it by promoting each to its own snapshot, which the
`(root)` rules above then leave alone:

```css
.masthead { view-transition-name: masthead; }
.landing-footer { view-transition-name: site-footer; }
```

Only the page content cross-fades now; the frame stays put.

**A `view-transition-name` must be unique in the document.** If two elements
ever carry the same name the browser aborts the transition entirely and you get
a hard swap with no fade. Both selectors match exactly one element today —
`SiteHeader` and `LandingFooter` each render once from the layout — so if you
add a second masthead-like element (a duplicated bar inside the mobile sheet,
say), give it a different class or no name at all.

If you need to confirm the fix is live: the navigation is client-side either
way, so measure the masthead instead. Its computed `opacity` stays `1` for the
whole navigation when the shell is excluded, and dips below `1` when it is
not.

Browsers without `document.startViewTransition` simply hard-swap the page —
the site stays fully functional. This replaces the old hand-rolled
`static/js/transitions.js` (fetch + DOMParser + `history.pushState`), which
SvelteKit's router now handles natively.

[View Transitions API]: https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
