## Smooth transitions between posts is basically:

1. Intercept link clicks
2. Fetch the next page HTML
3. Parse out the <main> content
4. Fade old content out, swap it in, fade new content in


```css
main {
  transition: opacity 0.2s ease;
}
```

```js
document.addEventListener('click', async (e) => {
  const link = e.target.closest('a[href^="/"]');
  if (!link) return;
  e.preventDefault();

  const res = await fetch(link.href);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const newContent = doc.querySelector('main');
  const current = document.querySelector('main');

  current.style.opacity = '0';
  await new Promise(r => setTimeout(r, 200)); // match CSS transition
  current.replaceWith(newContent);
  newContent.style.opacity = '0';
  requestAnimationFrame(() => newContent.style.opacity = '1');

  history.pushState({}, '', link.href);
  document.title = doc.title;
});
```
