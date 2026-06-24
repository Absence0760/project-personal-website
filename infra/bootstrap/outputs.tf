output "state_bucket" {
  description = "Bucket name to use in dns/backend.tf."
  value       = aws_s3_bucket.state.id
}

output "region" {
  description = "Region the state bucket lives in. The dns stack must use the same value."
  value       = var.aws_region
}
