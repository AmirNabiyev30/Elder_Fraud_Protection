# Elastic Beanstalk Application
resource "aws_elastic_beanstalk_application" "elder_fraud_protection" {
  name        = "elder-fraud-protection"
  description = "Elder Fraud Protection - Flask API backend with ML-based scam detection"
}

# Elastic Beanstalk Environment
resource "aws_elastic_beanstalk_environment" "elder_fraud_env" {
  name                = "elder-fraud-protection-env"
  application         = aws_elastic_beanstalk_application.elder_fraud_protection.name
  solution_stack_name = "64bit Amazon Linux 2023 v4.5.0 running Python 3.12"
  cname_prefix        = "jxzzzzz-elder-fraud-protection"

  # Instance profile for EC2 instances
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = "aws-elasticbeanstalk-ec2-role"
  }

  # Environment type - single instance for dev (saves cost)
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"
  }

  # Application port - Flask runs on 8000
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "PORT"
    value     = "8000"
  }

  # WSGI path for the Flask application
  setting {
    namespace = "aws:elasticbeanstalk:container:python"
    name      = "WSGIPath"
    value     = "backend/run:app"
  }
}

# Output the environment URL
output "environment_url" {
  value       = aws_elastic_beanstalk_environment.elder_fraud_env.endpoint_url
  description = "The URL of the Elastic Beanstalk environment"
}

output "environment_cname" {
  value       = aws_elastic_beanstalk_environment.elder_fraud_env.cname
  description = "The CNAME of the Elastic Beanstalk environment"
}
