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
  #api_url = "https://api.us5.datadoghq.com"
  api_url = "https://datadoghq.com"
}

# Monitor para alta taxa de erros
resource "datadog_monitor" "zupper_api_errors" {
  name    = "Service zupper-api Alta Taxa de Erros"
  type    = "query alert"
  query   = "sum(last_1m):trace.aspnet_core.request.errors{env:prod,service:auth-dotnet}.as_count() / sum:trace.aspnet_core.request.hits{env:prod,service:auth-dotnet}.as_count() * 100 > 20"
  message = <<EOT
{{#is_alert}}Service zupper-api com Alta Taxa de Erros{{/is_alert}}
{{#is_alert_recovery}}Service zupper-api com Alta Taxa de Erros voltou ao normal{{/is_alert_recovery}} @slack-channel
EOT

  tags = ["team:sre", "terraform:true", "service:auth-dotnet", "env:prod"]
  priority = 1
  notify_no_data = false
  notify_audit = false
  require_full_window = true
  evaluation_delay = 0
  timeout_h = 0

  monitor_thresholds {
    critical = 20
    critical_recovery = 14
  }
}

# Monitor para alta latência
resource "datadog_monitor" "zupper_api_latency" {
  name    = "Service zupper-api Alta Latência"
  type    = "query alert"
  query   = "percentile(last_10m):p75:trace.aspnet_core.request{env:prod,service:auth-dotnet} > 2.5"
  message = <<EOT
{{#is_alert}}Service zupper-api com Alta Latência no endpoint {{resource_name.name}}{{/is_alert}}
{{#is_alert_recovery}}Service zupper-api Alta Latência voltou ao normal{{/is_alert_recovery}} 
EOT

  tags = ["team:sre", "terraform:true", "service:auth-dotnet", "env:prod"]
  priority = 1
  notify_no_data = false
  notify_audit = false
  require_full_window = true
  evaluation_delay = 0
  timeout_h = 0

  monitor_thresholds {
    critical = 2.5
    critical_recovery = 2
  }
}

# Monitor para disponibilidade de containers
resource "datadog_monitor" "zupper_api_container_availability" {
  name    = "Service zupper-api Container Disponibilidade"
  type    = "query alert"
  query   = "avg(last_1h):docker.containers.running{docker_image:172597598159.dkr.ecr.us-east-1.amazonaws.com/anthropic-stories:latest} by {service} < 1"
  message = <<EOT
{{#is_alert}}Service zupper-api container não está em execução{{/is_alert}}
{{#is_alert_recovery}}Service zupper-api container voltou a executar normalmente{{/is_alert_recovery}} @slack-channel
EOT

  tags = ["team:sre", "terraform:true", "service:auth-dotnet", "env:prod"]
  priority = 1
  notify_no_data = false
  notify_audit = false
  require_full_window = true
  evaluation_delay = 0
  timeout_h = 0

  monitor_thresholds {
    critical = 1
  }
}

# SLO combinando todos os monitores
resource "datadog_service_level_objective" "zupper_api_slo" {
  name        = "zupper-api"
  type        = "monitor"
  description = "SLO para zupper-api cobrindo erros, latência e disponibilidade de containers."

  monitor_ids = [
    datadog_monitor.zupper_api_errors.id,
    datadog_monitor.zupper_api_latency.id,
    datadog_monitor.zupper_api_container_availability.id
  ]

  thresholds {
    timeframe = "30d"
    target    = 90
    warning   = 95
  }

  tags = ["team:sre", "terraform:true", "service:auth-dotnet", "env:prod"]
}

# Definição de serviço
resource "datadog_service_definition_yaml" "service_definition_v2_2" {
  service_definition = <<EOF
schema-version: v2.2
dd-service: zupper
team: sre
contacts:
  - name: Support Email
    type: email
    contact: rock.meira@contabilizei.com.br
  - name: Support Slack
    type: slack
    contact: https://www.slack.com/archives/zupper
description: shopping cart service responsible for managing shopping carts
tier: high
lifecycle: production
application: zupper
languages: 
  - python
type: web 
links:
  - name: zupper source code
    type: repo
    provider: gerrit
    url: http://github/zupper
tags:
  - team:zupper
  - cost-center:sre
integrations:
extensions:
EOF
}
