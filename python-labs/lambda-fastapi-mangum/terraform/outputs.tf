output "function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.fastapi_mangum.function_name
}

output "function_arn" {
  description = "Lambda function ARN"
  value       = aws_lambda_function.fastapi_mangum.arn
}

output "layers" {
  description = "Lambda layers applied"
  value       = aws_lambda_function.fastapi_mangum.layers
}

output "datadog_config" {
  description = "Datadog configuration summary"
  value = {
    dd_service = var.dd_service
    dd_env     = var.dd_env
    dd_version = var.dd_version
    dd_site    = var.datadog_site
  }
}
