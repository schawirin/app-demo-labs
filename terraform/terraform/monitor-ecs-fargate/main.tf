terraform {
  required_providers {
    datadog = {
      source  = "DataDog/datadog"
      version = ">= 3.0.0"
    }
  }
}

provider "datadog" {
  api_key = var.datadog_api_key
  app_key = var.datadog_app_key
  api_url = "https://api.datadoghq.com"
}

# Monitor para alta latência
resource "datadog_monitor" "api_latency" {
  for_each = { for service in var.services : service.name => service }

  name    = "Service ${each.value.name} Alta Latência"
  type    = "query alert"
  query   = <<EOT
percentile(last_10m):p75:${each.value.trace_metric}{env:${var.env},service:${each.value.name}} > ${var.latency_threshold}
EOT

  message = <<EOT
{{#is_alert}} 🚨 ALTA LATÊNCIA 🚨  
Serviço **${each.value.name}** detectou alta latência!  
Framework: ${each.value.framework}  
Métrica: ${each.value.trace_metric}  
Env: ${var.env}  
Threshold: ${var.latency_threshold}s  
${join(" ", var.oncall_contacts)}
{{/is_alert}}

{{#is_alert_recovery}} ✅ LATÊNCIA NORMALIZADA ✅  
A latência do serviço **${each.value.name}** voltou ao normal.  
{{/is_alert_recovery}}
EOT

  tags = ["team:sre", "terraform:true", "service:${each.value.name}", "env:${var.env}"]
  priority = 1

  monitor_thresholds {
    critical = var.latency_threshold
  }
}

# Monitor para alta taxa de erros
resource "datadog_monitor" "api_errors" {
  for_each = { for service in var.services : service.name => service }

  name    = "Service ${each.value.name} Alta Taxa de Erros"
  type    = "query alert"
  query   = <<EOT
sum(last_1m):${each.value.trace_metric}.hits{env:${var.env},service:${each.value.name}}.as_count() > ${var.error_rate_threshold}
EOT

  message = <<EOT
{{#is_alert}} 🚨 ALTA TAXA DE ERROS 🚨  
Serviço **${each.value.name}** apresentou uma taxa de erro elevada!  
Framework: ${each.value.framework}  
Métrica: ${each.value.trace_metric}  
Env: ${var.env}  
Threshold: ${var.error_rate_threshold}%  
{{/is_alert}}

{{#is_alert_recovery}} ✅ ERROS NORMALIZADOS ✅  
A taxa de erros do serviço **${each.value.name}** voltou ao normal.  
{{/is_alert_recovery}}
EOT

  tags = ["team:sre", "terraform:true", "service:${each.value.name}", "env:${var.env}"]
  priority = 1

  monitor_thresholds {
    critical = var.error_rate_threshold
  }
}

# Monitor para verificar se o serviço ECS está rodando
resource "datadog_monitor" "ecs_service_status" {
  for_each = { for service in var.services : service.name => service }

  name    = "ECS Service ${each.value.name} - Nenhuma Task Rodando"
  type    = "query alert"
  query   = <<EOT
avg(last_5m):aws.ecs.service.running{service:${each.value.ecs_service_name}} < 1
EOT

  message = <<EOT
{{#is_alert}} 🚨 ECS SERVICE DOWN 🚨  
Nenhuma Task está rodando para o serviço **${each.value.ecs_service_name}**.  
Verifique logs e eventos do ECS imediatamente.  
${join(" ", var.oncall_contacts)}
{{/is_alert}}

{{#is_alert_recovery}} ✅ ECS SERVICE ONLINE ✅  
O serviço **${each.value.ecs_service_name}** voltou a rodar no ECS.  
{{/is_alert_recovery}}
EOT

  tags = ["team:sre", "terraform:true", "service:${each.value.ecs_service_name}", "env:${var.env}"]
  priority = 1

  monitor_thresholds {
    critical = 1  # Se houver menos de 1 task rodando, alerta crítico
  }
}




resource "datadog_service_level_objective" "api_slo" {
  for_each = { for service in var.services : service.name => service }

  name        = "SLO ${each.value.name}"
  type        = "monitor"
  description = "SLO para ${each.value.name}, baseado em latência, erros e disponibilidade do ECS."

  monitor_ids = [
    datadog_monitor.api_latency[each.value.name].id,
    datadog_monitor.api_errors[each.value.name].id,
    datadog_monitor.ecs_service_status[each.value.name].id  # 🔹 Adicionamos este monitor
  ]

  thresholds {
    timeframe = "30d"
    target    = 95  # 🔹 Mantemos um target adequado
    warning   = 99  # 🔹 Warning sempre maior que target
  }

  tags = ["team:sre", "terraform:true", "service:${each.value.name}", "env:${var.env}"]
}

# Definição de serviço no Datadog Service Catalog
resource "datadog_service_definition_yaml" "service_definition" {
  for_each = { for service in var.services : service.name => service }

  service_definition = <<EOF
schema-version: v2.2
dd-service: ${each.value.name}
team: sre
contacts:
  - name: OnCall PagerDuty
    type: pagerduty
    contact: https://pagerduty.com/service/${each.value.name}
  - name: Slack SRE Alerts
    type: slack
    contact: https://www.slack.com/archives/sre-alerts
description: Serviço responsável por ${each.value.name}
tier: high
lifecycle: production
application: ${each.value.name}
languages: 
  - ${each.value.framework}
type: web
links:
  - name: Código Fonte
    type: repo
    provider: github
    url: https://github.com/meu-org/${each.value.name}
tags:
  - team:sre
  - cost-center:infra
integrations:
extensions:
EOF
}
