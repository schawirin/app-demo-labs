# Terraform configuration for Lambda + Datadog APM Lab

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
# IAM Role para Lambda
# ====================

resource "aws_iam_role" "lambda_role" {
  name = "${var.function_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

# Attach basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Policy adicional para Datadog Extension
resource "aws_iam_role_policy" "datadog_extension" {
  name = "${var.function_name}-datadog-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# ====================
# Package Lambda Function
# ====================

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../lambda/handler.py"
  output_path = "${path.module}/lambda_function.zip"
}

# ====================
# Lambda Function
# ====================

resource "aws_lambda_function" "datadog_lab" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = var.function_name
  role            = aws_iam_role.lambda_role.arn
  handler          = "datadog_lambda.handler.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime         = var.runtime
  memory_size     = var.memory_size
  timeout         = var.timeout

  # Datadog Lambda Extension + Python Layer
  layers = compact([
    var.datadog_extension_layer_arn,
    var.datadog_python_layer_arn
  ])

  # Environment variables
  environment {
    variables = {
      # Datadog Configuration
      DD_API_KEY         = var.datadog_api_key
      DD_SITE            = var.datadog_site
      DD_ENV             = var.dd_env
      DD_SERVICE         = var.dd_service
      DD_VERSION         = var.dd_version
      DD_TRACE_ENABLED   = var.dd_trace_enabled
      DD_LOGS_INJECTION  = var.dd_logs_injection

      # Datadog Lambda Handler Wrapper
      DD_LAMBDA_HANDLER = "handler.lambda_handler"

      # Datadog Lambda Extension Settings
      DD_SERVERLESS_LOGS_ENABLED = "true"
      DD_ENHANCED_METRICS        = "true"
      DD_MERGE_XRAY_TRACES       = "false"

      # Application settings
      ENVIRONMENT = var.dd_env
    }
  }

  tags = merge(
    var.tags,
    {
      Name = var.function_name
    }
  )
}

# ====================
# CloudWatch Log Group
# ====================

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = 7

  tags = var.tags
}

# ====================
# Lambda Function URL (Optional - para invocar via HTTP)
# ====================

resource "aws_lambda_function_url" "lambda_url" {
  function_name      = aws_lambda_function.datadog_lab.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = ["*"]
    allow_methods = ["POST", "GET"]
    allow_headers = ["*"]
    max_age       = 300
  }
}

# ====================
# Lambda Permission para Function URL
# ====================

resource "aws_lambda_permission" "allow_function_url" {
  statement_id           = "AllowExecutionFromFunctionURL"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.datadog_lab.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}
