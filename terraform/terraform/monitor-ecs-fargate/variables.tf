variable "datadog_api_key" {
  type        = string
  sensitive   = true
  description = "Datadog API Key"
}

variable "ecs_cluster" {
  description = "Nome do cluster ECS onde as tasks estão rodando"
  type        = string
  default     = "default-cluster"
}


variable "datadog_app_key" {
  type        = string
  sensitive   = true
  description = "Datadog Application Key"
}

variable "env" {
  description = "Ambiente de deploy (ex: prod, staging)"
  type        = string
  default     = "prod"
}

variable "latency_threshold" {
  description = "Limite de latência para alerta (em segundos)"
  type        = number
  default     = 2.5
}

variable "error_rate_threshold" {
  description = "Limite de taxa de erros para alerta (em porcentagem)"
  type        = number
  default     = 20
}
variable "oncall_contacts" {
  description = "Lista de contatos on-call para alertas"
  type        = list(string)
  default     = ["@pagerduty-team", "@slack-sre-alerts"]
}


variable "services" {
  description = "Lista de serviços monitorados"
  type = list(object({
    name             = string
    framework        = string
    trace_metric     = string
    ecs_service_name = string  # Adicionamos o nome do serviço no ECS
  }))
  default = [
    {
      name         = "mq-receiver"
      framework    = "java"
      trace_metric = "trace.servlet.request"
      ecs_service_name = "mdl-mq-receiver-svc-hext"
    }
  ]
}



