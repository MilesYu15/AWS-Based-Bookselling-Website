// var hostnameTemp = process.env.DBhostname;
// var hostname = hostnameTemp.split(":")[0];

module.exports = {
  secret: "CSYE6225",
  aws_S3_bucket: process.env.S3name,
  aws_region: "us-east-1",
  password_topic_arn: process.env.PasswordTopicArn
};

