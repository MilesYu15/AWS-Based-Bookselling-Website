
resource "aws_vpc" "csye6225-a4" {
  cidr_block                       = var.vpc_cidr
  enable_dns_hostnames             = true
  enable_dns_support               = true
  enable_classiclink_dns_support   = true
  assign_generated_ipv6_cidr_block = true
  tags = {
    Name   = "csye6225-a4",
    NewTag = "New Tag"
  }
}

resource "aws_subnet" "subnet1" {
  cidr_block              = var.subnet_cidr1
  vpc_id                  = aws_vpc.csye6225-a4.id
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
  tags = {
    Name = "csye6225-a4-subnet1"
  }

}

resource "aws_subnet" "subnet2" {
  cidr_block              = var.subnet_cidr2
  vpc_id                  = aws_vpc.csye6225-a4.id
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true
  tags = {
    Name = "csye6225-a4-subnet2"
  }

}

resource "aws_subnet" "subnet3" {
  cidr_block              = var.subnet_cidr3
  vpc_id                  = aws_vpc.csye6225-a4.id
  availability_zone       = "us-east-1c"
  map_public_ip_on_launch = true
  tags = {
    Name = "csye6225-a4-subnet3"
  }

}

resource "aws_internet_gateway" "csye6225-a4-gw" {
  vpc_id = aws_vpc.csye6225-a4.id

  tags = {
    Name = "csye6225-a4-gw"
  }
}

resource "aws_route_table" "csye6225-a4-rt" {
  vpc_id = aws_vpc.csye6225-a4.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.csye6225-a4-gw.id
  }

  tags = {
    Name = "csye6225-a4-rt"
  }
}

resource "aws_route_table_association" "csye6225-a4-rta1" {
  subnet_id      = aws_subnet.subnet1.id
  route_table_id = aws_route_table.csye6225-a4-rt.id
}

resource "aws_route_table_association" "csye6225-a4-rta2" {
  subnet_id      = aws_subnet.subnet2.id
  route_table_id = aws_route_table.csye6225-a4-rt.id
}

resource "aws_route_table_association" "csye6225-a4-rta3" {
  subnet_id      = aws_subnet.subnet3.id
  route_table_id = aws_route_table.csye6225-a4-rt.id
}


resource "aws_security_group" "ec2_sg" {
  name        = "application"
  description = "EC2 Security Group for inbound and outbound traffic"
  vpc_id      = aws_vpc.csye6225-a4.id

  # ingress {
  #   description      = "SSH"
  #   from_port        = 22
  #   to_port          = 22
  #   protocol         = "TCP"
  #   cidr_blocks      = var.cidr_blocks_ipv4_everywhere
  #   ipv6_cidr_blocks = var.cidr_blocks_ipv6_everywhere
  # }

  ingress {
    description      = "HTTP"
    from_port        = 80
    to_port          = 80
    protocol         = "TCP"
    security_groups = [aws_security_group.lb_sg.id]
  }

  ingress {
    description      = "MySQL"
    from_port        = 3306
    to_port          = 3306
    protocol         = "TCP"
    security_groups = [aws_security_group.lb_sg.id]
  }

  ingress {
    description      = "Angular"
    from_port        = 3000
    to_port          = 3000
    protocol         = "TCP"
    security_groups = [aws_security_group.lb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = var.cidr_blocks_ipv4_everywhere
  }
}

resource "aws_security_group" "db_sg" {
  name        = "database"
  description = "Database Security Group for inbound and outbound traffic"
  vpc_id      = aws_vpc.csye6225-a4.id

  ingress {
    description     = "MySQL"
    from_port       = 3306
    to_port         = 3306
    protocol        = "TCP"
    security_groups = [aws_security_group.ec2_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = var.cidr_blocks_ipv4_everywhere
  }
}

resource "aws_kms_key" "mykey" {
  description             = "This key is used to encrypt bucket objects"
  deletion_window_in_days = 30
}

resource "aws_s3_bucket" "b1" {
  bucket = "webapp.jiachen.yu"
  acl    = "private"

  force_destroy = true

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm     = "AES256"
      }
    }
  }

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "HEAD", "GET", "DELETE"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
  }

  lifecycle_rule {
    enabled = true

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
  }


}

resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "db_subnet_group"
  subnet_ids = [aws_subnet.subnet1.id, aws_subnet.subnet2.id, aws_subnet.subnet3.id]

  tags = {
    Name = "My DB subnet group"
  }
}

resource "aws_db_instance" "webapp_db" {
  name                   = "csye6225"
  engine                 = "mysql"
  allocated_storage      = var.db_allocated_storage
  instance_class         = "db.t3.micro"
  multi_az               = "false"
  identifier             = var.db_identifier
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  publicly_accessible    = "false"
  skip_final_snapshot    = "true"
  #performance_insights_enabled = true
  storage_encrypted = true
  vpc_security_group_ids = [aws_security_group.db_sg.id]
}

data "aws_ami" "ubuntu" {
  owners      = ["self", var.dev_userid]
  most_recent = true
}

resource "aws_dynamodb_table" "dynamodb_table" {
  name           = "csye6225"
  hash_key       = "id"
  read_capacity  = 20
  write_capacity = 20

  attribute {
    name = "id"
    type = "S"
  }

  ttl {
    attribute_name = "ExpirationTime"
    enabled        = true
  }
}

resource "aws_iam_policy" "webappS3" {
  name   = "WebAppS3"
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:DeleteObject",
                "s3:GetObject",
                "s3:PutObject",
                "s3:ListBucket"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::webapp.jiachen.yu",
                "arn:aws:s3:::webapp.jiachen.yu/*"
            ]
        }
    ]
}
  EOF
}

resource "aws_iam_role" "ec2" {
  name               = "EC2-CSYE6225"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "s3.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "attachment1" {
  role       = aws_iam_role.ec2.name
  policy_arn = aws_iam_policy.webappS3.arn
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "ec2_profile"
  role = aws_iam_role.CodeDeployEC2ServiceRole.name
}

data "aws_iam_user" "cicd" {
  user_name = var.cicd_username
}

resource "aws_iam_policy" "CodeDeploy-EC2-S3" {
  name   = "CodeDeploy-EC2-S3"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
      {
          "Action": [
              "s3:Get*",
              "s3:List*"
          ],
          "Effect": "Allow",
          "Resource": [
              "arn:aws:s3:::codedeploy.jiachenyu.me",
              "arn:aws:s3:::codedeploy.jiachenyu.me/*"
            ]
      },
      {
          "Action": [
              "s3:Delete*",
              "s3:Get*",
              "s3:Put*",
              "s3:List*"
          ],
          "Effect": "Allow",
          "Resource": [
              "arn:aws:s3:::webapp.jiachen.yu",
              "arn:aws:s3:::webapp.jiachen.yu/*"
          ]
      }
  ]
}
  EOF
}

resource "aws_iam_policy" "CircleCI-Upload-To-S3" {
  name   = "CircleCI-Upload-To-S3"
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:Get*",
                "s3:List*"
            ],
            "Resource": [
                "arn:aws:s3:::codedeploy.jiachenyu.me",
                "arn:aws:s3:::codedeploy.jiachenyu.me/*"
            ]
        }
    ]
}
  EOF
}

resource "aws_iam_policy" "CircleCI-Code-Deploy" {
  name   = "CircleCI-Code-Deploy"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:RegisterApplicationRevision",
        "codedeploy:GetApplicationRevision"
      ],
      "Resource": [
        "arn:aws:codedeploy:us-east-1:442012749277:application:csye6225-webapp"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:CreateDeployment",
        "codedeploy:GetDeployment"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:GetDeploymentConfig"
      ],
      "Resource": [
        "arn:aws:codedeploy:us-east-1:442012749277:deploymentconfig:CodeDeployDefault.OneAtATime",
        "arn:aws:codedeploy:us-east-1:442012749277:deploymentconfig:CodeDeployDefault.HalfAtATime",
        "arn:aws:codedeploy:us-east-1:442012749277:deploymentconfig:CodeDeployDefault.AllAtOnce"
      ]
    }
  ]
}
  EOF  
}

resource "aws_iam_user_policy_attachment" "circleci-upload-attach" {
  user       = data.aws_iam_user.cicd.user_name
  policy_arn = aws_iam_policy.CircleCI-Upload-To-S3.arn
}

resource "aws_iam_user_policy_attachment" "circleci-code-attach" {
  user       = data.aws_iam_user.cicd.user_name
  policy_arn = aws_iam_policy.CircleCI-Code-Deploy.arn
}

resource "aws_iam_role" "CodeDeployEC2ServiceRole" {
  name               = "CodeDeployEC2ServiceRole"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "codedeploy-ec2-attach" {
  role       = aws_iam_role.CodeDeployEC2ServiceRole.name
  policy_arn = aws_iam_policy.CodeDeploy-EC2-S3.arn
}

resource "aws_iam_role_policy_attachment" "cloudwatch-ec2-attach" {
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
  role = aws_iam_role.CodeDeployEC2ServiceRole.name
}

resource "aws_iam_role_policy_attachment" "sns-ec2-attach" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSNSFullAccess"
  role = aws_iam_role.CodeDeployEC2ServiceRole.name
}


resource "aws_iam_role" "CodeDeployServiceRole" {
  name               = "CodeDeployServiceRole"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "codedeploy.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "AWSCodeDeployRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"
  role       = aws_iam_role.CodeDeployServiceRole.name
}

resource "aws_codedeploy_app" "csye6225-webapp" {
  compute_platform = "Server"
  name             = "csye6225-webapp"
}

resource "aws_codedeploy_deployment_group" "deploy-group" {
  app_name              = aws_codedeploy_app.csye6225-webapp.name
  deployment_group_name = "csye6225-webapp-deployment"
  service_role_arn      = aws_iam_role.CodeDeployServiceRole.arn
  deployment_config_name = "CodeDeployDefault.AllAtOnce"

  autoscaling_groups = [aws_autoscaling_group.asg.name]

  deployment_style {
    deployment_type   = "IN_PLACE"
  }

  ec2_tag_set {
    ec2_tag_filter {
      key   = "Deploy"
      type  = "KEY_AND_VALUE"
      value = "csye6225_webapp"
    }
  }

    auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }
}

resource "aws_launch_configuration" "as_conf" {
  name          = "asg_launch_config"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"
  key_name      = var.key_name
  enable_monitoring = true
  associate_public_ip_address = true

  user_data = <<-EOF
    #! /bin/bash
    echo export DBname=${aws_db_instance.webapp_db.name} >> /etc/profile
    echo export DBusername=${aws_db_instance.webapp_db.username} >> /etc/profile
    echo export DBpassword=${aws_db_instance.webapp_db.password} >> /etc/profile
    echo export S3name=${aws_s3_bucket.b1.bucket} >> /etc/profile
    echo export DBhostname=${aws_db_instance.webapp_db.endpoint} >> /etc/profile
    echo export PasswordTopicArn=${aws_sns_topic.password_reset.arn} >> /etc/profile
    echo DBname=${aws_db_instance.webapp_db.name} >> /home/ubuntu/server.env
    echo DBusername=${aws_db_instance.webapp_db.username} >> /home/ubuntu/server.env
    echo DBpassword=${aws_db_instance.webapp_db.password} >> /home/ubuntu/server.env
    echo S3name=${aws_s3_bucket.b1.bucket} >> /home/ubuntu/server.env
    echo DBhostname=${aws_db_instance.webapp_db.endpoint} >> /home/ubuntu/server.env
    echo PasswordTopicArn=${aws_sns_topic.password_reset.arn} >> /home/ubuntu/server.env
  EOF

  iam_instance_profile    = aws_iam_instance_profile.ec2_profile.name
  security_groups = [aws_security_group.ec2_sg.id]

  root_block_device {
    volume_size           = var.ec2_volume_size
    volume_type           = var.ec2_volume_type
    delete_on_termination = "true"
  }
}

resource "aws_autoscaling_group" "asg" {
  name = "webapp_asg"
  max_size = 5
  min_size = 2
  default_cooldown = 60
  desired_capacity = 2
  force_delete = true
  launch_configuration = aws_launch_configuration.as_conf.name
  vpc_zone_identifier = [aws_subnet.subnet1.id,aws_subnet.subnet2.id, aws_subnet.subnet3.id]
  target_group_arns         = [aws_lb_target_group.lb_target80.arn, aws_lb_target_group.lb_target3000.arn]

  tag {
    key = "Deploy"
    value = "csye6225_webapp"
    propagate_at_launch = true
  }
}

resource "aws_autoscaling_policy" "scaleup" {
  name                   = "scaleup_policy"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 60
  autoscaling_group_name = aws_autoscaling_group.asg.name
}

resource "aws_autoscaling_policy" "scaledown" {
  name                   = "scaledown_policy"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 60
  autoscaling_group_name = aws_autoscaling_group.asg.name
}

resource "aws_cloudwatch_metric_alarm" "alarm_scaleup" {
  alarm_name          = "alarm_scaleup"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "60"
  statistic           = "Average"
  threshold           = "70"

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.asg.name
  }

  alarm_description = "Scale-up if CPU > 5% for 1 minutes"
  alarm_actions     = [aws_autoscaling_policy.scaleup.arn]
}

resource "aws_cloudwatch_metric_alarm" "alarm_scaledown" {
  alarm_name          = "alarm_scaledown"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "60"
  statistic           = "Average"
  threshold           = "3"

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.asg.name
  }

  alarm_description = "Scale-up if CPU < 3% for 1 minutes"
  alarm_actions     = [aws_autoscaling_policy.scaledown.arn]
}

resource "aws_lb_target_group" "lb_target80" {
  name     = "webapp-lb-target80"
  port     = 80
  protocol = "HTTP"
  target_type = "instance"
  vpc_id   = aws_vpc.csye6225-a4.id
  stickiness {    
      type            = "lb_cookie"    
      cookie_duration = 3600   
      enabled         = true 
  }
}

resource "aws_lb_target_group" "lb_target3000" {
  name     = "webapp-lb-target3000"
  port     = 3000
  protocol = "HTTP"
  target_type = "instance"
  vpc_id   = aws_vpc.csye6225-a4.id
  stickiness {    
      type            = "lb_cookie"    
      cookie_duration = 3600   
      enabled         = true 
  }
}

resource "aws_security_group" "lb_sg" {
  name        = "load_balancer"
  description = "Load Balancer security group for inbound and outbound traffic"
  vpc_id      = aws_vpc.csye6225-a4.id

  # ingress {
  #   description      = "HTTP"
  #   from_port        = 80
  #   to_port          = 80
  #   protocol         = "TCP"
  #   cidr_blocks      = var.cidr_blocks_ipv4_everywhere
  #   ipv6_cidr_blocks = var.cidr_blocks_ipv6_everywhere
  # }

  ingress {
    description      = "HTTPS"
    from_port        = 443
    to_port          = 443
    protocol         = "TCP"
    cidr_blocks      = var.cidr_blocks_ipv4_everywhere
    ipv6_cidr_blocks = var.cidr_blocks_ipv6_everywhere
  }

  ingress {
    description      = "MySQL"
    from_port        = 3306
    to_port          = 3306
    protocol         = "TCP"
    cidr_blocks      = var.cidr_blocks_ipv4_everywhere
    ipv6_cidr_blocks = var.cidr_blocks_ipv6_everywhere
  }

  ingress {
    description      = "Angular"
    from_port        = 3000
    to_port          = 3000
    protocol         = "TCP"
    cidr_blocks      = var.cidr_blocks_ipv4_everywhere
    ipv6_cidr_blocks = var.cidr_blocks_ipv6_everywhere
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = var.cidr_blocks_ipv4_everywhere
  }
}

resource "aws_lb" "lb" {
  name               = "webapp-lb"
  internal           = false
  load_balancer_type = "application"
  subnets            = [aws_subnet.subnet1.id,aws_subnet.subnet2.id, aws_subnet.subnet3.id]
  security_groups = [aws_security_group.lb_sg.id]

  enable_deletion_protection = false
}

# resource "aws_lb_listener" "listener80" {
#   load_balancer_arn = aws_lb.lb.arn
#   port              = "80"
#   protocol          = "HTTP"

#   default_action {
#     target_group_arn = aws_lb_target_group.lb_target80.arn
#     type = "forward"
#   }
# }

resource "aws_lb_listener" "listener3000" {
  load_balancer_arn = aws_lb.lb.arn
  port              = "3000"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = data.aws_acm_certificate.prod.arn

  default_action {
    target_group_arn = aws_lb_target_group.lb_target3000.arn
    type = "forward"
  }
}

data "aws_acm_certificate" "prod" {
  domain   = "prod.jiachenyu.me"
  statuses = ["ISSUED"]
  types = ["IMPORTED"]
  most_recent = true
}

resource "aws_lb_listener" "listenerHTTPS" {
  load_balancer_arn = aws_lb.lb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = data.aws_acm_certificate.prod.arn

  default_action {
    target_group_arn = aws_lb_target_group.lb_target80.arn
    type = "forward"
  }
}

resource "aws_route53_record" "route53" {
  zone_id = "Z00469128JEGY2K4P2O4"
  name    = "prod.jiachenyu.me"
  type    = "A"

  alias {
    name                   = aws_lb.lb.dns_name
    zone_id                = aws_lb.lb.zone_id
    evaluate_target_health = true
  }
}

resource "aws_iam_role" "lambda_role" {
  name = "iam_for_lambda_with_sns"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_policy" "lambda_logging" {
  name        = "lambda_logging"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_policy" "lambda_dynamodb" {
  name        = "lambda_dynamodb"
  description = "IAM policy for accessing DynamoDB from a lambda"

  policy = <<EOF
{
	"Version": "2012-10-17",
	"Statement": [{
			"Effect": "Allow",
			"Action": [
				"dynamodb:BatchGetItem",
				"dynamodb:GetItem",
				"dynamodb:Query",
				"dynamodb:Scan",
				"dynamodb:BatchWriteItem",
				"dynamodb:PutItem",
				"dynamodb:UpdateItem"
			],
			"Resource": "arn:aws:dynamodb:*:*:*"
		}
  ]
}
EOF
}

resource "aws_iam_policy" "lambda_ses" {
  name        = "lambda_ses"
  description = "IAM policy for accessing SES from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
      {
          "Effect": "Allow",
          "Action": [
              "ses:SendEmail",
              "ses:SendRawEmail"
          ],
          "Resource": "*"
      }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_logging.arn
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_dynamodb.arn
}

resource "aws_iam_role_policy_attachment" "lambda_ses" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_ses.arn
}

data "archive_file" "dummy" {
  type = "zip"
  output_path = "${path.module}/lambda_function_payload.zip"

  source {
    content = "hello"
    filename = "dummy.txt"
  }
}

resource "aws_lambda_function" "func" {
  filename      =  data.archive_file.dummy.output_path
  function_name = "lambda_password_reset"
  role          =  aws_iam_role.lambda_role.arn
  handler       = "lambda_password_reset.password_reset"
  runtime       = "nodejs12.x"
  depends_on = [aws_iam_role_policy_attachment.lambda_logs]
}

resource "aws_sns_topic" "password_reset" {
  name = "password_reset"
}

resource "aws_sns_topic_subscription" "lambda" {
  topic_arn = aws_sns_topic.password_reset.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.func.arn
}

resource "aws_lambda_permission" "with_sns" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.func.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.password_reset.arn
}

