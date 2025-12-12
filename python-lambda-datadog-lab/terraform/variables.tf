# Variables for Lambda + Datadog Layer deployment

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "function_name" {
  description = "Nome da função Lambda"
  type        = string
  default     = "datadog-apm-lab-python"
}

variable "runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "python3.12"
}

variable "memory_size" {
  description = "Lambda memory size (MB)"
  type        = number
  default     = 512
}

variable "timeout" {
  description = "Lambda timeout (seconds)"
  type        = number
  default     = 30
}

# Datadog Configuration
variable "datadog_api_key" {
  description = "Datadog API Key"
  type        = string
  sensitive   = true
}

variable "datadog_site" {
  description = "Datadog site (datadoghq.com, datadoghq.eu, etc)"
  type        = string
  default     = "datadoghq.com"
}

variable "dd_env" {
  description = "Datadog environment tag"
  type        = string
  default     = "lab"
}

variable "dd_service" {
  description = "Datadog service name"
  type        = string
  default     = "lambda-python-lab"
}

variable "dd_version" {
  description = "Datadog version tag"
  type        = string
  default     = "1.0.0"
}

variable "dd_trace_enabled" {
  description = "Enable Datadog tracing"
  type        = bool
  default     = true
}

variable "dd_logs_injection" {
  description = "Enable Datadog logs injection"
  type        = bool
  default     = true
}

# Datadog Lambda Extension Layer ARN
# Get latest ARNs from: https://docs.datadoghq.com/serverless/libraries_integrations/extension/
variable "datadog_extension_layer_arn" {
  description = "ARN do Datadog Lambda Extension Layer"
  type        = string
  # Exemplo para us-east-1 (python3.12): arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:XX
  # Substitua XX pela versão mais recente
  default = ""
}

variable "datadog_python_layer_arn" {
  description = "ARN do Datadog Python Layer"
  type        = string
  # Exemplo para us-east-1: arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:XX
  # Substitua XX pela versão mais recente
  default = ""
}

# Tags
variable "tags" {
  description = "Tags para recursos AWS"
  type        = map(string)
  default = {
    Project     = "Datadog-APM-Lab"
    Environment = "lab"
    ManagedBy   = "Terraform"
  }
}
