# AWS-Based-Bookselling-Website
This application implements a simple bookselling app, in which a registered user can create, update, and view listings for books to sell. This application is designed to be deployed on AWS EC2 instances and use AWS Lambda for part of its business logic. It also uses Amazon Relational Database as its database and Amazon S3 for object storage. The CI/CD pipeline is set up on CircleCI. 

## :trophy: Features
 - Developed front-end layer using AngularJS, back-end layer using NodeJS framework, object storage using AWS S3, and data storage using MySQL on Amazon Relational Database Service
 - Deployed the front-end and back-end layer on AWS EC2 instances with autoscaling capability
 - Implemented AWS Lambda functions with Function as a service concept to send email notifications
 - Applied Infrastructure as Code concept to create and manage infrastructure on AWS via Terraform and Github
 - Incorporated CI/CD strategies using CircleCI and AWS CodeDeploy to automate the testing and deployment process for the server and lambda functions


## Application Components
This repository includes the code for web application and setting up the necessary infrastructure on AWS

### AMI (Amazon Machine Images)
The machine image is created by Packer and will install Apache2 server, Nodejs, AWS Codedeploy agent and AWS Cloudwatch agent. The created image is later used to create AWS EC2 instances. 

### Infrastructure
The infrastructure required is created and managed using Terraform. Terraform modules will create AWS VPC and subents for networking, AWS Relational Database and DynamoDB for database, AWS S3 for storage, AWS EC2 instances and deployment groups for deployment, Cloudwatch and AWS Elastic Load Balancing for monitoring and load balancing, AWS IAM users and security groups for access control, AWS Lambda for business logic. 

### Front End Application
The front-end application is built using AngularJS and deployed on EC2 instances. When the application needs to communicate with the backend, it does so by issuing REST API calls to the backend. 

### Back End Application
The back-end application is headless NodeJS server deployed on EC2 instances. The backend handles most of the business logic: create and update a user, list books for sale, get details about a specific book, create and update an item, mark an item as sold. <br />
Access is restricted only to registered and authenticated users. Each user can only modify their own items. To accomplish this, after a user is authenticated, the client will receive JWT token which it should then use when making REST API calls.

### FaaS (Function as a Service)
The Lambda function also has its own CI/CD pipeline using CircleCI and AWS CodeDeploy. In case the user needs to reset their password, a Lambda function is called to send an email to the registered email of the user. We use DynamoDB to keep track of the expiration time of these emails. 