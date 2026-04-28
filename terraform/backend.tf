terraform {
  backend "s3" {
    bucket = "terraform-state-efp-zhu0lin-781980106104-us-east-1-an"
    key    = "core/terraform.tfstate"
    region = "us-east-1"
  }
}