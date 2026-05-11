terraform {
  backend "s3" {
    bucket = "terraform-state-elder-fraud-protection-jxzzzzz"
    key    = "terraform.tfstate"
    region = "us-east-2"
  }
}
