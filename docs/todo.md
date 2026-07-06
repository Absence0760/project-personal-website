# Infra / DNS TODO

Operational follow-ups for this repo's Terraform (`infra/`) and the cross-account
DNS it manages. Product/content work doesn't belong here — this is the infra
backlog. Tick items off as they land.

## 1. Apply the DNS Terraform — NOT YET APPLIED

`infra/` is authored, `terraform validate`-clean, and committed, but has **never
been `terraform apply`-ed**. The live `jaredhoward.com` zone is adopted only on
paper; until this runs, DNS is still effectively console-managed and the
Terraform is aspirational.

Run once, as `AWS_PROFILE=personal-website` (SSO-logged-in):

```
export AWS_PROFILE=personal-website
cd infra/bootstrap && terraform init && terraform apply     # creates state bucket personal-website-tfstate
cd ../dns          && terraform init && terraform plan       # GATE: must be "11 to import, 0 to add, 0 to change, 0 to destroy"
                      terraform apply                         # imports only
rm imports.tf      && terraform plan                          # must be "No changes", then commit the deletion
```

**Gate:** if the `dns` plan shows *any* add/change/destroy, a record in
`records.tf` has drifted from live DNS — fix the config, do **not** apply. This
zone serves the live site, the Migadu mail records, and the disag delegation;
every apply is load-bearing. Full detail: [`../infra/README.md`](../infra/README.md).

- [ ] `bootstrap` applied (state bucket exists)
- [ ] `dns` plan is a clean 11-import, no changes
- [ ] `dns` applied; `imports.tf` removed; follow-up plan is "No changes"

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
- [ ] When section 1's apply runs, re-verify `disag_delegation_ns` still matches
      disag's live child-zone name servers (query disag's account, or
      `dig NS disag.jaredhoward.com +short`) before applying.

## 3. (Future) consider whether DNS apply should move to CI

Today the `infra/` stacks are applied locally by the operator — there's no
GitHub OIDC role in this account (the website deploys separately via GitHub
Pages). If DNS changes get frequent, revisit adding an OIDC deploy role +
plan-on-PR. Not worth it for an apex zone that changes a few times a year.
