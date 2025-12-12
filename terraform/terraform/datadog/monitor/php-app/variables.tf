variable "datadog_api_key" {
  type      = string
  sensitive = true
}

variable "datadog_app_key" {
  type      = string
  sensitive = true
}

variable "services" {
  type        = list(string)
  description = "Lista de serviços Java a serem monitorados"
  default     = ["service1"]
}
