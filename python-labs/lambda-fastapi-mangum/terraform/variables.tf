variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "function_name" {
  description = "Lambda function name"
  type        = string
  default     = "fastapi-mangum-test"
}

variable "fastapi_layer_arn" {
  description = "ARN of the FastAPI + Mangum layer"
  type        = string
  default     = "arn:aws:lambda:us-east-1:061039767542:layer:fastapi-mangum-layer:2"
}

variable "datadog_extension_layer_arn" {
  description = "ARN of the Datadog Extension layer"
  type        = string
  default     = "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67"
}

variable "datadog_python_layer_arn" {
  description = "ARN of the Datadog Python layer"
  type        = string
  default     = "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114"
}

variable "datadog_api_key" {
  description = "Datadog API key"
  type        = string
  sensitive   = true
}

variable "datadog_site" {
  description = "Datadog site"
  type        = string
  default     = "datadoghq.com"
}

variable "dd_env" {
  description = "Environment tag"
  type        = string
  default     = "lab"
}

variable "dd_service" {
  description = "Service name"
  type        = string
  default     = "fastapi-mangum-test"
}

variable "dd_version" {
  description = "Version"
  type        = string
  default     = "1.0.0"
}
