# Terraform to add Datadog layers to existing Lambda
# This manages the fastapi-mangum-test Lambda created via AWS CLI

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Import existing Lambda function
data "aws_lambda_function" "existing" {
  function_name = var.function_name
}

# Update Lambda with Datadog layers
resource "aws_lambda_function" "fastapi_mangum" {
  function_name = var.function_name
  role          = data.aws_lambda_function.existing.role
  handler       = "datadog_lambda.handler.handler"
  runtime       = data.aws_lambda_function.existing.runtime
  memory_size   = data.aws_lambda_function.existing.memory_size
  timeout       = data.aws_lambda_function.existing.timeout

  # Keep existing code
  filename         = "${path.module}/dummy.zip"
  source_code_hash = filebase64sha256("${path.module}/dummy.zip")

  # Add Datadog layers
  layers = [
    var.fastapi_layer_arn,
    var.datadog_extension_layer_arn,
    var.datadog_python_layer_arn
  ]

  # Environment variables with Datadog configuration
  environment {
    variables = {
      DD_API_KEY                 = var.datadog_api_key
      DD_SITE                    = var.datadog_site
      DD_ENV                     = var.dd_env
      DD_SERVICE                 = var.dd_service
      DD_VERSION                 = var.dd_version
      DD_TRACE_ENABLED           = "true"
      DD_LOGS_INJECTION          = "true"
      DD_LAMBDA_HANDLER          = "handler.handler"
      DD_SERVERLESS_LOGS_ENABLED = "true"
      DD_ENHANCED_METRICS        = "true"
      DD_TRACE_DEBUG             = "true"
      DD_LOG_LEVEL               = "debug"
    }
  }

  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash,
    ]
  }

  tags = {
    Environment = var.dd_env
    ManagedBy   = "Terraform"
    Purpose     = "Datadog APM Testing - Support Case 2392372"
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = 7

  tags = {
    ManagedBy = "Terraform"
  }
}
