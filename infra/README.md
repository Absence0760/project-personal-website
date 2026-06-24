# infra/ — Terraform for the jaredhoward.com DNS zone

This account (`136758763748`, the "Jared" account, SSO profile
`personal-website`) is deliberately tiny: the website itself is served by
**GitHub Pages** (no S3/CloudFront/ACM in this account), so the only
provisioned AWS resource is the **`jaredhoward.com` Route 53 hosted zone**.
This Terraform adopts that zone so DNS stops being hand-edited in the console.

> **Why this is load-bearing.** The apex zone serves the live site, carries
> the Migadu mail records (`docs/email-setup.md`), and delegates
> `disag.jaredhoward.com` to another account. A wrong record + an `apply`
> breaks site, email, or the disag delegation. Always `plan` and read the
> diff before `apply`. See `docs/domain-setup.md`.

## Layout

```
infra/
  bootstrap/    one-shot: creates the S3 state bucket (LOCAL state)
  dns/          the zone + all records (REMOTE state in that bucket)
```

Convention mirrors `project-running/infra` (sibling repo): an S3 backend with
S3-native locking (`use_lockfile = true`, Terraform ≥ 1.10 — no DynamoDB), one
KMS-free state bucket per account. There is **no `infra-secrets` subdir for this
project** — a static GitHub-Pages site with public DNS has nothing to encrypt.

## First-time setup (run once)

All commands require `AWS_PROFILE=personal-website` and a live SSO session:

```
aws sso login --profile personal-website
export AWS_PROFILE=personal-website
```

**1. Create the state bucket (local state):**

```
cd infra/bootstrap && terraform init && terraform apply
```

**2. Adopt the live zone (remote state + import):**

```
cd ../dns && terraform init && terraform plan
```

The plan **must** read `11 to import, 0 to add, 0 to change, 0 to destroy`
(1 zone + 10 records). Any add/change/destroy means a definition in
`records.tf` drifted from live DNS — fix it and re-plan; **do not apply**.

```
terraform apply          # performs the imports only
```

**3. Retire the import blocks:**

```
rm imports.tf && terraform plan   # must say "No changes"
git add -A && git commit
```

## Steady state

Edit `records.tf` (or the defaults in `variables.tf`), `terraform plan`, read
the diff, `terraform apply`. Applied locally by the operator — there is no CI
deploy role for DNS (the website deploys separately via GitHub Pages /
`actions/deploy-pages`). State lives in the `personal-website-tfstate` bucket;
losing your laptop is fine — re-`init` elsewhere after `aws sso login`.

## Cross-repo coupling: the disag.jaredhoward.com delegation

`aws_route53_record.disag_ns` (in `dns/records.tf`, values in
`dns/variables.tf` → `disag_delegation_ns`) is a **delegation pointer**, not a
zone we own. The real `disag.jaredhoward.com` zone lives in **project-disag's**
AWS account (`406460434695`), created by the estate baseline; project-disag only
*reads* it via `data "aws_route53_zone"`.

**Direction of truth: disag's child-zone name servers → this NS record.** This
repo mirrors them. If project-disag ever recreates its zone (account rebuild,
zone destroy/recreate), AWS issues a new NS set and `disag_delegation_ns` here
goes stale — `disag.jaredhoward.com` then fails to resolve until it's updated to
match. The disag side, conversely, must not recreate that zone without updating
this record. Tracked in [`../docs/todo.md`](../docs/todo.md) §2; re-verify with
`dig NS disag.jaredhoward.com +short` against disag's live name servers.

## What is intentionally NOT here

- **ACM / CloudFront / S3 website** — GitHub Pages serves the site; the apex A
  records point at GitHub's anycast IPs.
- **GitHub OIDC / deploy role** — no Terraform runs in CI for this account.
- **Apex NS / SOA records** — managed implicitly by `aws_route53_zone`.
- **Secrets** — none. This repo and account hold no encrypted material.
