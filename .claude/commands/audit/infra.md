---
description: N/A for this repo — there is no infra-as-code. Kept as a stub in case the stack ever grows one.
---

Audit infrastructure-as-code for this repo.

## What this is

This repo has **no infra-as-code**. The site is a Zola build deployed to GitHub Pages via `.github/workflows/deploy.yml` using the official `actions/deploy-pages` action. There is no Terraform, no CloudFormation, no Pulumi, no Helm, no Kustomize. The only "infra" controls are:

- **GitHub repo settings** — branch protection, "Allow auto-merge", "Allow GitHub Actions to create and approve pull requests", required CI checks. These cannot be audited from inside the repo; they live in the repo's `Settings → Branches` and `Settings → Actions → General` pages.
- **Custom-domain wiring** — DNS in Route 53 (managed in a separate AWS account per the user's monorepo conventions; see `~/.claude/CLAUDE.md` notes on the multi-account setup), plus the `static/CNAME` file and `base_url` in `config.toml`. `docs/domain-setup.md` is the operator-facing record.

There is nothing in-tree to audit.

## What this command does

Respond with the following one-liner and exit:

> `/audit/infra` is **N/A** for this repo. There is no infra-as-code; GitHub Pages serves the bundle, deploy is via `actions/deploy-pages`. The DNS lives in a separate account (see `docs/domain-setup.md`). The only audit-able infra controls are GitHub repo settings (branch protection, Actions permissions), which can't be audited from inside the repo — open Settings → Branches and Settings → Actions → General to confirm.

Do not spawn an agent. Do not search for `infra/`, `*.tf`, `*.tfvars`, or `.sops.yaml` — they don't exist here.

## When this command will become real

If this repo ever:

- Grows an `infra/` directory with Terraform / Pulumi / CDK code, or
- Adds a custom hosting layer (CloudFront in front of S3, a worker on Cloudflare, etc.) with its own configuration files in-tree,

then this command needs a real body. The previous template revision had an extensive IAM least-privilege / OIDC / KMS / CloudFront-headers audit ready to adapt — look at the donor-project history in `git log` for prior shape.
