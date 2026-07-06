# DNS for jaredhoward.com — the apex public hosted zone for this
# account (the "Jared" account). This zone is the root of the whole
# personal estate's DNS: it serves the GitHub Pages site, carries the
# Migadu mail records, and delegates disag.jaredhoward.com to
# project-disag's account.
#
# The zone + every record below pre-existed this Terraform and were
# manually managed. They are ADOPTED by import (see imports.tf), not
# recreated — a clean `terraform plan` after import must show NO
# changes before the first apply. Getting a record definition wrong
# here breaks the live site, email, OR the disag delegation, so treat
# every apply as load-bearing (see docs/domain-setup.md).

provider "aws" {
  region = var.aws_region
  # Auth from the environment: AWS_PROFILE=personal-website, SSO-logged-in.
}

# ─────────────────── Hosted zone ───────────────────

resource "aws_route53_zone" "apex" {
  name = var.apex_domain

  tags = merge(
    {
      Project   = "personal-website"
      Stack     = "dns"
      ManagedBy = "terraform"
    },
    var.tags,
  )

  # Destroying the hosted zone wipes the NS-delegation chain at the
  # registrar and orphans the disag child delegation. Recovery means
  # re-pointing NS at the registrar within the SOA TTL. prevent_destroy
  # forces a deliberate `terraform state rm` first.
  lifecycle {
    prevent_destroy = true
  }
}
