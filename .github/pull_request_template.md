## Summary

<!-- 1–3 sentences on what this PR does and why. -->

## Changes

<!-- Bulleted list of the user-visible or developer-visible changes. -->

-
-

## Surface touched

- [ ] Site content (`content/`) — including the legal pages
- [ ] Templates (`templates/`)
- [ ] Static assets (`static/` — CSS, JS, images, `CNAME`, `cv.pdf`)
- [ ] Site config (`config.toml`)
- [ ] CI / GitHub Actions (`.github/`)
- [ ] Project docs (`docs/`, `CLAUDE.md`, `README.md`, etc.)
- [ ] `.claude/` tooling

## Static-site safety checklist

<!-- Tick what applies. Untick lines that genuinely don't apply, but
     don't delete the row — so the next reviewer can see you considered
     it. -->

- [ ] No third-party script / font / pixel / iframe added without a matching update to `content/privacy.md` (§4 and §8 commit the site to staying first-party only)
- [ ] No tracker / analytics / chat widget loaded on page load (consent gate or first-party only)
- [ ] No secret, API token, or private email address committed in HTML/JS/CSS or front-matter
- [ ] Legal-page edits run through `docs/legal-status.md` (Effective / Last reviewed updated where required; cross-references still resolve)
- [ ] Internal links still resolve (`zola build` exits 0; no dead anchors to `/terms/`, `/privacy/`, `/refunds/`, `/contact/`)
- [ ] If `static/CNAME` or `base_url` changed, `docs/domain-setup.md` was followed and re-verified

## Test plan

<!-- How this was verified. Delete rows that don't apply. -->

- [ ] `zola build` passes locally
- [ ] `zola serve` walkthrough on the affected pages
- [ ] CI build job is green

<!-- Walkthrough notes: -->
