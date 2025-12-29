variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

# Map of Lambda functions to manage with for_each
variable "lambda_functions" {
  description = "Map of Lambda functions to configure with Datadog"
  type = map(object({
    function_name          = string
    handler                = string
    original_handler       = string
    memory_size            = number
    timeout                = number
    dd_env                 = string
    dd_service             = string
    dd_version             = string
    log_retention_days     = number
    environment_variables  = map(string)
    tags                   = map(string)
  }))
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
