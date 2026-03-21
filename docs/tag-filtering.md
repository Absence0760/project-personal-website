## Tag filtering on the notes list

### How it works

1. Tags are declared in each post's frontmatter and registered as a Zola taxonomy
2. The section template collects all unique tags across posts and renders them as filter chips
3. Clicking a chip filters the list client-side with no page reload

---

### Adding tags to a post

In any post's frontmatter (e.g. `content/notes/my-post.md`):

```toml
+++
title = "My post"
date = 2026-01-01
[taxonomies]
tags = ["git", "tooling"]
+++
```

Tags are free-form strings. New tags appear automatically in the filter bar the next time the site is built.

---

### Files involved

| File | Role |
|---|---|
| `config.toml` | Registers `tags` as a Zola taxonomy |
| `content/**/*.md` | Posts declare their own tags in frontmatter |
| `templates/section.html` | Renders chips and the filtering script |
| `templates/taxonomy_list.html` | The `/tags/` page listing all tags |
| `templates/taxonomy_single.html` | The `/tags/git/` page listing posts for one tag |
| `static/css/style.css` | Styles for `.tag-chip`, `.tag-filter`, `.no-results` |

---

### Template logic (`section.html`)

The template loops over all pages in the section to collect tags, deduplicates and sorts them, then renders one `<button>` per tag plus an "All" reset button:

```html
<button class="tag-chip tag-chip--all" aria-pressed="true">All</button>
<button class="tag-chip" data-tag="git" aria-pressed="false">#git</button>
```

Each post `<li>` carries its tags as a comma-separated `data-tags` attribute:

```html
<li class="post-item" data-tags="git,tooling">...</li>
```

---

### Filtering logic (inline script)

- **"All" chip** is active by default — all posts are visible on load
- Clicking a tag chip adds it to an active `Set` and deactivates "All"
- Clicking an active chip again removes it from the set; if the set becomes empty, "All" reactivates
- Clicking "All" clears the set and reactivates all-posts view
- Match logic is **OR** — a post is visible if it has *any* of the active tags
- A "No posts match" message appears if the filter produces zero results
