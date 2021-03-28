provider "aws" {
  region  = "us-east-1"
  profile = "prod"
}

module "network" {
  source = "./modules/network"
}

