# Terraform to add Datadog layers to multiple Lambda functions using for_each
# This manages multiple Lambda functions with Datadog instrumentation

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

# Import existing Lambda functions
data "aws_lambda_function" "existing" {
  for_each = var.lambda_functions

  function_name = each.value.function_name
}

# Update Lambda functions with Datadog layers using for_each
resource "aws_lambda_function" "lambda_with_datadog" {
  for_each = var.lambda_functions

  function_name = each.value.function_name
  role          = data.aws_lambda_function.existing[each.key].role
  handler       = each.value.handler
  runtime       = data.aws_lambda_function.existing[each.key].runtime
  memory_size   = each.value.memory_size
  timeout       = each.value.timeout

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
    variables = merge(
      each.value.environment_variables,
      {
        DD_API_KEY                 = var.datadog_api_key
        DD_SITE                    = var.datadog_site
        DD_ENV                     = each.value.dd_env
        DD_SERVICE                 = each.value.dd_service
        DD_VERSION                 = each.value.dd_version
        DD_TRACE_ENABLED           = "true"
        DD_LOGS_INJECTION          = "true"
        DD_LAMBDA_HANDLER          = each.value.original_handler
        DD_SERVERLESS_LOGS_ENABLED = "true"
        DD_ENHANCED_METRICS        = "true"
        DD_TRACE_DEBUG             = "true"
        DD_LOG_LEVEL               = "debug"
      }
    )
  }

  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash,
    ]
  }

  tags = merge(
    each.value.tags,
    {
      ManagedBy   = "Terraform"
      LambdaKey   = each.key
    }
  )
}

# CloudWatch Log Group for each Lambda
resource "aws_cloudwatch_log_group" "lambda_logs" {
  for_each = var.lambda_functions

  name              = "/aws/lambda/${each.value.function_name}"
  retention_in_days = each.value.log_retention_days

  tags = {
    ManagedBy = "Terraform"
    LambdaKey = each.key
  }
}
