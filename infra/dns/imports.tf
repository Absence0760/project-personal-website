# ─────────────────── One-time adoption of the live zone ───────────────────
#
# These `import` blocks (Terraform >= 1.5) adopt the pre-existing,
# manually-created zone + records into state. Route 53 record import
# IDs are `ZONEID_NAME_TYPE`, underscore-delimited.
#
# Workflow:
#   1. terraform plan      → must report "N to import, 0 to add,
#                            0 to change, 0 to destroy". ANY add/change/
#                            destroy means a record definition in
#                            records.tf doesn't match live DNS — fix it,
#                            do NOT apply.
#   2. terraform apply     → performs the imports only.
#   3. DELETE THIS FILE and `terraform plan` again → must be clean
#      ("No changes"). Import blocks are one-shot; leaving them is
#      harmless but noisy.
#
# Apex NS and SOA are intentionally NOT imported — they are managed
# implicitly by aws_route53_zone.apex.

import {
  to = aws_route53_zone.apex
  id = "Z02347803DK87AY1684ZJ"
}

import {
  to = aws_route53_record.apex_a
  id = "Z02347803DK87AY1684ZJ_jaredhoward.com_A"
}

import {
  to = aws_route53_record.www_cname
  id = "Z02347803DK87AY1684ZJ_www.jaredhoward.com_CNAME"
}

import {
  to = aws_route53_record.mx
  id = "Z02347803DK87AY1684ZJ_jaredhoward.com_MX"
}

import {
  to = aws_route53_record.apex_txt
  id = "Z02347803DK87AY1684ZJ_jaredhoward.com_TXT"
}

import {
  to = aws_route53_record.dmarc
  id = "Z02347803DK87AY1684ZJ__dmarc.jaredhoward.com_TXT"
}

import {
  to = aws_route53_record.dkim["key1"]
  id = "Z02347803DK87AY1684ZJ_key1._domainkey.jaredhoward.com_CNAME"
}

import {
  to = aws_route53_record.dkim["key2"]
  id = "Z02347803DK87AY1684ZJ_key2._domainkey.jaredhoward.com_CNAME"
}

import {
  to = aws_route53_record.dkim["key3"]
  id = "Z02347803DK87AY1684ZJ_key3._domainkey.jaredhoward.com_CNAME"
}

import {
  to = aws_route53_record.disag_ns
  id = "Z02347803DK87AY1684ZJ_disag.jaredhoward.com_NS"
}
