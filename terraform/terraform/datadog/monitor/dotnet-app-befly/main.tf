terraform {
  required_providers {
    datadog = {
      source  = "datadog/datadog"
      version = ">= 3.0.0"
    }
  }
}

provider "datadog" {
  api_key = var.datadog_api_key
  app_key = var.datadog_app_key
  #api_url = "https://api.us5.datadoghq.com"
  api_url = "https://api.datadoghq.com"
}

# Monitor para alta taxa de erros
resource "datadog_monitor" "pagare_api_errors" {
  name    = "Service pagare-api Alta Taxa de Erros"
  type    = "query alert"
  query   = "sum(last_1m):trace.aspnet.request.errors{env:production,service:pagare.befly.com.br}.as_count() / sum:trace.aspnet.request.hits{env:production,service:pagare.befly.com.br}.as_count() * 100 > 20"
  message = <<EOT
{{#is_alert}}Service pagare-api com Alta Taxa de Erros{{/is_alert}}
{{#is_alert_recovery}}Service pagare-api com Alta Taxa de Erros voltou ao normal{{/is_alert_recovery}} 
EOT

  tags = ["team:pagare", "terraform:true", "service:pagare.befly.com.br", "env:production"]
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
resource "datadog_monitor" "pagare_api_latency" {
  name    = "Service pagare-api Alta Latência"
  type    = "query alert"
  query   = "count(last_10m):p75:trace.aspnet.request{env:production,service:pagare.befly.com.br} > 2.5"
  message = <<EOT
{{#is_alert}}Service pagare-api com Alta Latência no endpoint {{resource_name.name}}{{/is_alert}}
{{#is_alert_recovery}}Service pagare-api Alta Latência voltou ao normal{{/is_alert_recovery}} 
EOT

  tags = ["team:pagare", "terraform:true", "service:pagare.befly.com.br", "env:production"]
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



#### ftg

# Monitor para alta taxa de erros
resource "datadog_monitor" "ftg_api_errors" {
  name    = "Service ftg-api Alta Taxa de Erros"
  type    = "query alert"
  query   = "sum(last_1m):trace.aspnet.request.errors{env:production,service:ftg/agencias30}.as_count() / sum:trace.aspnet.request.hits{env:production,service:ftg/agencias30}.as_count() * 100 > 20"
  message = <<EOT
{{#is_alert}}Service ftg/agencias30com Alta Taxa de Erros{{/is_alert}}
{{#is_alert_recovery}}Service ftg/agencias30com Alta Taxa de Erros voltou ao normal{{/is_alert_recovery}} 
EOT

  tags = ["team:ftg", "terraform:true", "service:ftg/agencias30", "env:production"]
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
resource "datadog_monitor" "ftg_api_latency" {
  name    = "Service ftg/agencias30Alta Latência"
  type    = "query alert"
  query   = "count(last_10m):p75:trace.aspnet.request{env:production,service:ftg/agencias30} > 2.5"
  message = <<EOT
{{#is_alert}}Service ftg/agencias30com Alta Latência no endpoint {{resource_name.name}}{{/is_alert}}
{{#is_alert_recovery}}Service ftg/agencias30Alta Latência voltou ao normal{{/is_alert_recovery}} 
EOT

  tags = ["team:ftg", "terraform:true", "service:ftg/agencias30", "env:production"]
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

##process

resource "datadog_monitor" "ftg_agencias30_process" {
  name = "Monitor: Process ftg-agencias30 Running"
  type = "query alert"
  query = "avg(last_1m):avg:datadog.process.processes.host_instance{name:ftg-agencias30} < 1"
  message = <<-EOT
    ALERT: The process ftg-agencias30 is not running on host {{host.name}}.
    Please verify that the process is up and running.
  EOT
  tags = ["process:ftg-agencias30", "env:production"]
  priority         = 1
  notify_no_data   = false
  require_full_window = true
}




# SLO combinando todos os monitores ftg
resource "datadog_service_level_objective" "ftg_api_slo" {
  name        = "ftg/agencias30"
  type        = "monitor"
  description = "SLO para ftg/agencias30 cobrindo erros, latência "

    monitor_ids = [
    datadog_monitor.ftg_api_errors.id,
    datadog_monitor.ftg_api_latency.id,
    datadog_monitor.ftg_agencias30_process.id
  ]


  thresholds {
    timeframe = "30d"
    target    = 90
    warning   = 95
  }

  tags = ["team:ftg", "terraform:true", "service:pagare.befly.com.br", "env:production"]
}

# SLO combinando todos os monitores
resource "datadog_service_level_objective" "pagare_api_slo" {
  name        = "pagare-api"
  type        = "monitor"
  description = "SLO para pagare-api cobrindo erros, latência "

  monitor_ids = [
    datadog_monitor.pagare_api_errors.id,
    datadog_monitor.pagare_api_latency.id
   # datadog_monitor.pagare_api_container_availability.id
  ]

  thresholds {
    timeframe = "30d"
    target    = 90
    warning   = 95
  }

  tags = ["team:pagare", "terraform:true", "service:pagare.befly.com.br", "env:production"]
}

# Definição de serviço
resource "datadog_service_definition_yaml" "service_definition_v2_2" {
  service_definition = <<EOF
schema-version: v2.2
dd-service: pagare
team: sre
contacts:
  - name: Support Email
    type: email
    contact: 
  - name: Support Slack
    type: slack
    contact: https://www.slack.com/archives/pagare
description: shopping cart service responsible for managing shopping carts
tier: high
lifecycle: production
application: pagare
languages: 
  - python
type: web 
links:
  - name: pagare source code
    type: repo
    provider: gerrit
    url: http://github/pagare
tags:
  - team:pagare
  - cost-center:sre
integrations:
extensions:
EOF
}
