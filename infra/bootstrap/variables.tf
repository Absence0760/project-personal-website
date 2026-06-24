variable "aws_region" {
  description = "Region for the Terraform state bucket. Matches the rest of the estate (us-east-1)."
  type        = string
  default     = "us-east-1"
}

variable "state_bucket_name" {
  description = "Name of the S3 bucket holding remote tfstate for the dns stack. Locking is S3-native (use_lockfile = true) — no DynamoDB table needed since Terraform 1.10. Must match the bucket hard-coded in dns/backend.tf. S3 bucket names are GLOBALLY unique — change if this one is taken."
  type        = string
  default     = "personal-website-tfstate"
}
