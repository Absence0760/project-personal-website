# Remote state in the bucket created by `infra/bootstrap`. Locking is
# S3-native via `use_lockfile = true` (Terraform >= 1.10) — no
# DynamoDB table required. The bucket name must match
# bootstrap/variables.tf `state_bucket_name`.
terraform {
  backend "s3" {
    bucket       = "personal-website-tfstate-136758763748"
    key          = "dns/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}
