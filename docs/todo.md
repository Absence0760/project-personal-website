# Infra / DNS TODO

Operational follow-ups for this repo's Terraform (`infra/`) and the cross-account
DNS it manages. Product/content work doesn't belong here — this is the infra
backlog. Tick items off as they land.

## 1. Apply the DNS Terraform — DONE (2026-07-10)

The one-time adoption ran on 2026-07-10. Notes from the run (details in
[`../infra/README.md`](../infra/README.md)):

- The state bucket is **`personal-website-tfstate-136758763748`** — the bare
  `personal-website-tfstate` name was already taken globally by an unrelated
  AWS account, so it's account-ID-suffixed per the estate
  `<slug>-tfstate-<account-id>` convention.
- The import count is **10** (1 zone + 9 records), not the 11 previously
  written here — apex NS/SOA are managed implicitly and never imported.
- The zone `comment` had to be pinned to the live value and the zone tags
  pre-applied via the CLI so the plan could be gated on zero changes.

- [x] `bootstrap` applied (state bucket exists)
- [x] `dns` plan was a clean 10-import, no changes
- [x] `dns` applied; `imports.tf` removed; follow-up plan is "No changes"

Steady state from here: edit `records.tf`, `terraform plan`, read the diff,
`terraform apply` — every apply is still load-bearing (live site, Migadu mail,
disag delegation).

## 2. Keep the `disag.jaredhoward.com` delegation in sync — CROSS-REPO

This repo and **project-disag** are coupled through one DNS hand-off, and both
sides have to stay conscious of it:

- **Child zone** `disag.jaredhoward.com` lives in **project-disag's** AWS account,
  created by the estate baseline (`new-project-account.sh
  disag`). project-disag *references* it via `data "aws_route53_zone"` — it does
  not create it, and its name servers are assigned by AWS when that zone is made.
- **Parent NS delegation** lives **here**, in `infra/dns/records.tf`
  (`aws_route53_record.disag_ns`), with the four NS values in
  `infra/dns/variables.tf` (`disag_delegation_ns`).

**The child zone's name servers are the source of truth; this repo only mirrors
them.** If project-disag's child zone is ever recreated (account rebuild, zone
`destroy`/recreate, region move), AWS issues a **new** NS set and the values here
go stale → `disag.jaredhoward.com` stops resolving until `disag_delegation_ns` is
updated to match. Conversely, nobody on the disag side should assume the zone can
be freely recreated without updating this record.

- [x] Mirror this coupling note into project-disag — done in its
      `web/infra/route53.tf` (commit `7cf4b3f`, on `main`), where the zone is
      referenced, so the disag side is warned before recreating its zone.
- [x] When section 1's apply runs, re-verify `disag_delegation_ns` still matches
      disag's live child-zone name servers (query disag's account, or
      `dig NS disag.jaredhoward.com +short`) before applying — verified
      2026-07-10 against the child zone's authoritative delegation set
      (`Z0902104SIJBX05AR40E` in the disag account); all four NS match.

## 3. (Future) consider whether DNS apply should move to CI

Today the `infra/` stacks are applied locally by the operator — there's no
GitHub OIDC role in this account (the website deploys separately via GitHub
Pages). If DNS changes get frequent, revisit adding an OIDC deploy role +
plan-on-PR. Not worth it for an apex zone that changes a few times a year.
