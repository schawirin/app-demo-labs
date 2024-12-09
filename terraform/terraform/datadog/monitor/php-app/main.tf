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
}

# Monitor for High Error Rate
resource "datadog_monitor" "php_zupper_api_errors" {
  name    = "Service zupper-api High Error Rate"
  type    = "query alert"
  query   = "sum(last_1m):trace.web.request.errors{env:prd,service:zupper-api}.as_count() / sum:trace.web.request.hits{env:prd,service:zupper-api}.as_count() * 100 > 20"
  message = <<EOT
{{#is_alert}}Service zupper-api has a high error rate (above 20%){{/is_alert}}
{{#is_alert_recovery}}Service zupper-api error rate has returned to normal{{/is_alert_recovery}} @slack-channel
EOT

  tags     = ["team:sre", "terraform:true", "service:zupper-api", "env:prd"]
  priority = 1

  monitor_thresholds {
    critical          = 20
    critical_recovery = 15
  }
}

# Monitor for High Latency
resource "datadog_monitor" "php_zupper_api_latency" {
  name    = "Service zupper-api High Latency"
  type    = "query alert"
  query   = "percentile(last_10m):p75:trace.web.request{env:prd,service:zupper-api} > 2.5"
  message = <<EOT
{{#is_alert}}Service zupper-api is experiencing high latency{{/is_alert}}
{{#is_alert_recovery}}Service zupper-api latency has returned to normal{{/is_alert_recovery}} @slack-channel
EOT

  tags     = ["team:sre", "terraform:true", "service:zupper-api", "env:prd"]
  priority = 1

  monitor_thresholds {
    critical          = 2.5
    critical_recovery = 2.0
  }
}

# Monitor for Container Availability
resource "datadog_monitor" "php_zupper_api_container_availability" {
  name    = "Service zupper-api Container Availability"
  type    = "query alert"
  query   = "avg(last_5m):docker.containers.running{image_name:zupper/php} by {service} < 1"
  message = <<EOT
{{#is_alert}}Service zupper-api container is not running{{/is_alert}}
{{#is_alert_recovery}}Service zupper-api container is running normally{{/is_alert_recovery}} @slack-channel
EOT

  tags     = ["team:sre", "terraform:true", "service:zupper-api", "env:prd"]
  priority = 1

  monitor_thresholds {
    critical = 1
  }
}

# Composite Monitor
resource "datadog_monitor" "php_composite_monitor" {
  name    = "PHP Service zupper-api Composite Monitor"
  type    = "composite"
  query   = "${datadog_monitor.php_zupper_api_errors.id} || ${datadog_monitor.php_zupper_api_latency.id} || ${datadog_monitor.php_zupper_api_container_availability.id}"
  message = <<EOT
{{#is_alert}}One or more issues detected in zupper-api:
- Errors: {{datadog_monitor.php_zupper_api_errors.name}}
- Latency: {{datadog_monitor.php_zupper_api_latency.name}}
- Container: {{datadog_monitor.php_zupper_api_container_availability.name}}

Please investigate. @slack-channel{{/is_alert}}
{{#is_alert_recovery}}All zupper-api monitors have recovered.{{/is_alert_recovery}}
EOT

  tags     = ["team:sre", "terraform:true", "service:zupper-api", "env:prd"]
  priority = 1
}

# SLO Combining All Monitors
resource "datadog_service_level_objective" "php_zupper_api_slo" {
  name        = "zupper-api"
  type        = "monitor"
  description = "SLO for zupper-api covering errors, latency, and container availability."

  monitor_ids = [
    datadog_monitor.php_zupper_api_errors.id,
    datadog_monitor.php_zupper_api_latency.id,
    datadog_monitor.php_zupper_api_container_availability.id
  ]

  thresholds {
    timeframe = "30d"
    target    = 90
    warning   = 95
  }

  tags = ["team:sre", "terraform:true", "service:zupper-api", "env:prd"]
}