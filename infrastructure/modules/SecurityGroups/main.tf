resource "aws_security_group" "ec2_sc" {
    name = "EC2 Security Group"
    description = "EC2 Security Group for inbound and outbound traffic"
    vpc_id = module.network.vpc_id

    ingress {
        description = "SSH"
        from_port = 0 
        to_port = 22
        protocol = "ssh"
    }

}