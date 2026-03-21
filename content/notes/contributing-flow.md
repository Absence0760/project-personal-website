+++
title = "Contributing Guide"
date = 2026-03-20
[taxonomies]
tags = ["git", "tooling", "fundamental"]
+++

## Work in a worktree
```txt
git worktree add ../worktree-branchName -b branchName
```

## Make meaningful commits

- Common types - feat, fix, refactor, test, chore, docs, perf
- Each commit should be atomic
```
<type>(<scope>): <short summary>
<optional body explaining WHY, not what>
<optional footer: BREAKING CHANGE, closes #issue>
```

## Keep your branch up to date

- Keeps a linear history
```bash
git fetch origin
git rebase origin/main
```

## Clean up commits before merging
```bash
git rebase -i origin/main
```

## Open PR
```bash
git push -u origin feature/your-branch
```

## Merge strategy

- Squash merge - all feature commits collapsed into one commit on main
- Won't pollute main's history
```bash
git checkout main
git merge --squash feature/your-branch-name
git commit -m "feat(auth): add OAuth token refresh (#42)"
```

## Clean up worktree
```bash
git worktree remove ../your-feature-folder
git branch -d feature/your-branch-name
```

## Remove all branches except main/dev/feature
```bash
git branch | grep -v "^\*\|master\|dev\|fix-pipeline/1230" | xargs git branch -D
```

## Release Strategy for Smaller Repos

This is simpler and more meaningful than v1.0.0 for a site where "breaking changes" don't really apply.

Workflow

1. Develop on dev — all changes go here
2. When ready to release, merge to main and tag:
3. CI/CD triggers on main push → deploys

For minor pushes to main ignore adding a tag.

```txt
    git checkout main
    git merge dev
    git tag -a v2026.03.20 -m "Release 2026.03.20"
    git push origin main --tags
```
