output "lambda_functions" {
  description = "Map of all Lambda functions managed"
  value = {
    for key, lambda in aws_lambda_function.lambda_with_datadog : key => {
      function_name = lambda.function_name
      function_arn  = lambda.arn
      handler       = lambda.handler
      runtime       = lambda.runtime
      memory_size   = lambda.memory_size
      timeout       = lambda.timeout
    }
  }
}

output "lambda_arns" {
  description = "Map of Lambda ARNs by key"
  value = {
    for key, lambda in aws_lambda_function.lambda_with_datadog : key => lambda.arn
  }
}

output "lambda_layers" {
  description = "Layers applied to each Lambda"
  value = {
    for key, lambda in aws_lambda_function.lambda_with_datadog : key => lambda.layers
  }
}

output "datadog_configurations" {
  description = "Datadog configuration for each Lambda"
  value = {
    for key, config in var.lambda_functions : key => {
      dd_service = config.dd_service
      dd_env     = config.dd_env
      dd_version = config.dd_version
      dd_site    = var.datadog_site
    }
  }
}

output "cloudwatch_log_groups" {
  description = "CloudWatch log groups for each Lambda"
  value = {
    for key, log_group in aws_cloudwatch_log_group.lambda_logs : key => log_group.name
  }
}

output "summary" {
  description = "Summary of all managed Lambdas"
  value = {
    total_lambdas = length(var.lambda_functions)
    lambda_keys   = keys(var.lambda_functions)
    region        = var.aws_region
  }
}
