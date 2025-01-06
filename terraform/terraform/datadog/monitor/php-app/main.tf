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
  #api_url = "https://datadoghq.com"
}

# Monitor for High Error Rate
resource "datadog_monitor" "php_datadog_api_errors" {
  name    = "Service intelichat-api High Error Rate"
  type    = "query alert"
  query   = "sum(last_1m):trace.web.request.errors{env:prod,service:apache2-php}.as_count() / sum:trace.web.request.hits{env:prod,service:apache2-php}.as_count() * 100 > 20"
  message = <<EOT
{{#is_alert}}Service intelichat-api has a high error rate (above 20%){{/is_alert}}
{{#is_alert_recovery}}Service intelichat-api error rate has returned to normal{{/is_alert_recovery}} @nuvem@qualitor.com.br
EOT

  tags     = ["team:sre", "terraform:true", "service:apache2-php", "env:prod"]
  priority = 1

  monitor_thresholds {
    critical          = 20
    critical_recovery = 15
  }
}

# Monitor for High Latency
resource "datadog_monitor" "php_datadog_api_latency" {
  name    = "Service intelichat-api High Latency"
  type    = "query alert"
  query   = "percentile(last_10m):p75:trace.web.request{env:prod,service:apache2-php} > 2.5"
  message = <<EOT
{{#is_alert}}Service intelichat-api is experiencing high latency{{/is_alert}}
{{#is_alert_recovery}}Service intelichat-api latency has returned to normal{{/is_alert_recovery}} @nuvem@qualitor.com.br
EOT

  tags     = ["team:sre", "terraform:true", "service:apache2-php", "env:prod"]
  priority = 1

  monitor_thresholds {
    critical          = 2.5
    critical_recovery = 2.0
  }
}

# Monitor for process Availability
resource "datadog_monitor" "php_datadog_api_process_availability" {
  name    = "Service intelichat process Availability"
  type    = "query alert"
  query   = "avg(last_5m):apache.performance.busy_workers{host:Intelichat} < 1"
  message = <<EOT
{{#is_alert}}Service intelichatcontainer is not running{{/is_alert}}
{{#is_alert_recovery}}Service intelichat process is running normally{{/is_alert_recovery}} @nuvem@qualitor.com.br
EOT

  tags     = ["team:sre", "terraform:true", "service:apache2-php", "env:prod"]
  priority = 1

  monitor_thresholds {
    critical = 1
  }
}

## Monitor for Container Availability
#resource "datadog_monitor" "php_datadog_api_container_availability" {
#  name    = "Service intelichat-api Container Availability"
#  type    = "query alert"
#  query   = "avg(last_5m):docker.containers.running{image_name:datadog/php} by {service} < 1"
#  message = <<EOT
#{{#is_alert}}Service intelichat-api container is not running{{/is_alert}}
#{{#is_alert_recovery}}Service intelichat-api container is running normally{{/is_alert_recovery}} 
#EOT
#
#  tags     = ["team:sre", "terraform:true", "service:apache2-php", "env:prod"]
#  priority = 1
#
#  monitor_thresholds {
#    critical = 1
#  }
#}

# Composite Monitor
resource "datadog_monitor" "php_composite_monitor" {
  name    = "PHP Service intelichat-api Composite Monitor"
  type    = "composite"
  query   = "${datadog_monitor.php_datadog_api_errors.id} || ${datadog_monitor.php_datadog_api_latency.id} || ${datadog_monitor.php_datadog_api_process_availability.id}"
  message = <<EOT
{{#is_alert}}One or more issues detected in intelichat:
- Errors: {{datadog_monitor.php_datadog_api_errors.name}}
- Latency: {{datadog_monitor.php_datadog_api_latency.name}}
- Process: {{datadog_monitor.php_datadog_api_process_availability.name}}

Please investigate. {{/is_alert}}
{{#is_alert_recovery}}All intelichat monitors have recovered.{{/is_alert_recovery}}
EOT

  tags     = ["team:sre", "terraform:true", "service:apache2-php", "env:prod"]
  priority = 1
}

# SLO Combining All Monitors
resource "datadog_service_level_objective" "php_datadog_api_slo" {
  name        = "intelichat"
  type        = "monitor"
  description = "SLO for intelichat covering errors, latency, and container availability."

  monitor_ids = [
    datadog_monitor.php_datadog_api_errors.id,
    datadog_monitor.php_datadog_api_latency.id,
    datadog_monitor.php_datadog_api_process_availability.id
  ]

  thresholds {
    timeframe = "30d"
    target    = 90
    warning   = 95
  }

  tags = ["team:sre", "terraform:true", "service:apache2-php", "env:prod"]
}