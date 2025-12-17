# Variables for Datadog instrumentation

variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "function_name" {
  description = "Lambda function name to instrument"
  type        = string
  default     = "clean-math-lambda"
}

# ====================
# Datadog Configuration
# ====================

variable "datadog_api_key" {
  description = "Datadog API Key"
  type        = string
  sensitive   = true
}

variable "datadog_site" {
  description = "Datadog Site (e.g., datadoghq.com)"
  type        = string
  default     = "datadoghq.com"
}

variable "dd_env" {
  description = "Datadog Environment"
  type        = string
  default     = "lab"
}

variable "dd_service" {
  description = "Datadog Service Name"
  type        = string
  default     = "clean-math-lambda"
}

variable "dd_version" {
  description = "Datadog Version"
  type        = string
  default     = "1.0.0"
}

# ====================
# Datadog Lambda Layers
# ====================

variable "datadog_extension_layer_arn" {
  description = "Datadog Lambda Extension Layer ARN"
  type        = string
  default     = "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67"
}

variable "datadog_python_layer_arn" {
  description = "Datadog Python Lambda Layer ARN"
  type        = string
  default     = "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114"
}
