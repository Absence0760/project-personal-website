output "zone_id" {
  description = "Route 53 hosted zone ID for jaredhoward.com."
  value       = aws_route53_zone.apex.zone_id
}

output "zone_name_servers" {
  description = "The zone's authoritative name servers — these are what the registrar's NS records must point at."
  value       = aws_route53_zone.apex.name_servers
}
