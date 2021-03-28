variable "vpc_cidr"{
    type = string
    default = "10.0.0.0/16"
}

variable "subnet_cidr1"{
    type = string
    default = "10.0.0.0/24"
}

variable "subnet_cidr2"{
    type = string
    default = "10.0.3.0/24"
}

variable "subnet_cidr3"{
    type = string
    default = "10.0.2.0/24"
}

variable "cidr_blocks_ipv4_everywhere" {
    type = list
    default = ["0.0.0.0/0"]
}

variable "cidr_blocks_ipv6_everywhere" {
    type = list
    default = ["::/0"]
}

variable "kms_key" {
    type = string
    default = "webapp"
}

variable "db_allocated_storage" {
    type = number
    default = 20
}

variable "db_identifier" {
    type = string
    default = "csye6225-su2020"
}

variable "db_username" {
    type = string
    default = "csye6225_su2020"
}

variable "db_password" {
    type = string
    default = "StrongPassword5!"
}

variable "ami_name" {
    type = list
    default = ["csye6225_a4_1592960692"]
}

variable "ec2_volume_size" {
    type = number
    default = 20
}

variable "ec2_volume_type" {
    type = string
    default = "gp2"
}

variable "key_name" {
    type = string
    default = "aws_ami"
}

variable "cicd_username" {
    type = string
    default = "cicd"
}

variable "dev_userid" {
    type = string
    default = "053325597395"
}
