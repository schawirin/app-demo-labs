# Terraform to ADD Datadog to existing clean-math-lambda
# This updates the Lambda WITHOUT changing any Python code

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ====================
# Get existing Lambda
# ====================

data "aws_lambda_function" "existing" {
  function_name = var.function_name
}

# ====================
# Create dummy deployment package (not used, just to satisfy Terraform)
# ====================

data "archive_file" "dummy" {
  type        = "zip"
  output_path = "${path.module}/dummy.zip"

  source {
    content  = "# Dummy file - actual code is already in Lambda"
    filename = "dummy.txt"
  }
}

# ====================
# Update Lambda with Datadog
# ====================

resource "aws_lambda_function" "with_datadog" {
  function_name = var.function_name
  role          = data.aws_lambda_function.existing.role
  runtime       = data.aws_lambda_function.existing.runtime

  # KEY CHANGE 1: Handler wrapper
  handler = "datadog_lambda.handler.handler"

  # Use dummy zip (code won't be updated due to lifecycle ignore)
  filename         = data.archive_file.dummy.output_path
  source_code_hash = data.archive_file.dummy.output_base64sha256

  # Keep existing settings
  timeout     = data.aws_lambda_function.existing.timeout
  memory_size = data.aws_lambda_function.existing.memory_size
  description = "Clean Math Lambda + Datadog APM (Zero Code Changes)"

  # KEY CHANGE 2: Add Datadog Layers
  layers = [
    var.datadog_extension_layer_arn,
    var.datadog_python_layer_arn
  ]

  # KEY CHANGE 3: Datadog Environment Variables
  environment {
    variables = merge(
      try(data.aws_lambda_function.existing.environment[0].variables, {}),
      {
        # Datadog Configuration
        DD_API_KEY                 = var.datadog_api_key
        DD_SITE                    = var.datadog_site
        DD_ENV                     = var.dd_env
        DD_SERVICE                 = var.dd_service
        DD_VERSION                 = var.dd_version

        # Enable APM Traces
        DD_TRACE_ENABLED           = "true"

        # Enable Log Injection
        DD_LOGS_INJECTION          = "true"

        # Original handler (before wrapper)
        DD_LAMBDA_HANDLER          = "handler.lambda_handler"

        # Serverless monitoring
        DD_SERVERLESS_LOGS_ENABLED = "true"
        DD_ENHANCED_METRICS        = "true"
        DD_MERGE_XRAY_TRACES       = "false"
      }
    )
  }

  lifecycle {
    ignore_changes = [
      # Ignore code changes - we're only updating config
      filename,
      source_code_hash,
    ]
  }

  tags = {
    Name                = var.function_name
    InstrumentedBy      = "Datadog"
    InstrumentationType = "Zero-Code"
    ManagedBy           = "Terraform"
  }
}

# ====================
# Output current config
# ====================

output "lambda_arn" {
  value       = aws_lambda_function.with_datadog.arn
  description = "Lambda ARN"
}

output "original_handler" {
  value       = data.aws_lambda_function.existing.handler
  description = "Original handler (before Datadog)"
}

output "new_handler" {
  value       = aws_lambda_function.with_datadog.handler
  description = "New handler (Datadog wrapper)"
}

output "datadog_config" {
  value = {
    dd_env     = var.dd_env
    dd_service = var.dd_service
    dd_version = var.dd_version
    dd_site    = var.datadog_site
  }
  description = "Datadog configuration"
}

output "layers_applied" {
  value = [
    var.datadog_extension_layer_arn,
    var.datadog_python_layer_arn
  ]
  description = "Datadog layers applied"
}

output "instrumentation_summary" {
  value = {
    traces_enabled  = "true"
    logs_injection  = "true"
    enhanced_metrics = "true"
    code_changes    = "ZERO"
  }
  description = "What was enabled"
}
