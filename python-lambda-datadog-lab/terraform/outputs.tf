# Terraform outputs

output "lambda_function_name" {
  description = "Nome da função Lambda"
  value       = aws_lambda_function.datadog_lab.function_name
}

output "lambda_function_arn" {
  description = "ARN da função Lambda"
  value       = aws_lambda_function.datadog_lab.arn
}

output "lambda_role_arn" {
  description = "ARN da IAM role"
  value       = aws_iam_role.lambda_role.arn
}

output "lambda_function_url" {
  description = "URL da função Lambda (HTTP endpoint)"
  value       = aws_lambda_function_url.lambda_url.function_url
}

output "cloudwatch_log_group" {
  description = "CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.lambda_logs.name
}

output "datadog_config" {
  description = "Configuração Datadog"
  value = {
    site    = var.datadog_site
    env     = var.dd_env
    service = var.dd_service
    version = var.dd_version
  }
}

output "invoke_command" {
  description = "Comando para invocar a função Lambda via AWS CLI"
  value       = "aws lambda invoke --function-name ${aws_lambda_function.datadog_lab.function_name} --payload file://payloads/health.json response.json"
}

output "logs_command" {
  description = "Comando para ver logs no CloudWatch"
  value       = "aws logs tail ${aws_cloudwatch_log_group.lambda_logs.name} --follow"
}
