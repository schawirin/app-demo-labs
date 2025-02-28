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
  api_url = "https://api.us5.datadoghq.com"
}

# Monitor de CPU
resource "datadog_monitor" "low_cpu_utilization" {
  name    = "Host CPU ociosa - Baixa Utilização"
  type    = "query alert"
  query   = "avg(last_30m):avg:system.cpu.idle{host:*} by {host} > 80"
  message = <<EOT
{{#is_alert}}O host {{host.name}} está com CPU ociosa acima de 80% por 30 minutos. Verifique possíveis otimizações de workload.{{/is_alert}}
{{#is_alert_recovery}}O host {{host.name}} voltou a ser utilizado normalmente.{{/is_alert_recovery}} @finops-test
EOT

  tags     = ["team:finops-test", "env:onprem", "resource:cpu", "downtime:true"]
  priority = 2
}

# Monitor de Memória
resource "datadog_monitor" "low_memory_utilization" {
  name    = "Host Memória - Alta Disponibilidade"
  type    = "query alert"
  query   = "avg(last_1h):avg:system.mem.pct_usable{host:*} by {host} > 80"
  message = <<EOT
{{#is_alert}}O host {{host.name}} está com mais de 80% de memória disponível por 1 hora. Considere otimizar a alocação de recursos.{{/is_alert}}
{{#is_alert_recovery}}O host {{host.name}} voltou a utilizar a memória de forma eficiente.{{/is_alert_recovery}} @finops-test
EOT

  tags     = ["team:finops-test", "env:onprem", "resource:memory", "downtime:true"]
  priority = 2
}

# Monitor de Disco
resource "datadog_monitor" "low_disk_activity" {
  name    = "Host Disco - Baixa Atividade"
  type    = "query alert"
  query   = "avg(last_1h):avg:system.io.util{host:*} by {host} < 10"
  message = <<EOT
{{#is_alert}}O host {{host.name}} apresenta baixa atividade de disco (utilização abaixo de 10%) por 1 hora. Verifique possíveis subutilizações.{{/is_alert}}
{{#is_alert_recovery}}O host {{host.name}} retomou a atividade normal de disco.{{/is_alert_recovery}} @finops-test
EOT

  tags     = ["team:finops-test", "env:onprem", "resource:disk", "downtime:true"]
  priority = 2
}

# Monitor Composto
resource "datadog_downtime_schedule" "off_hours_downtime" {
  scope            = "env:onprem" # Ajustado para uma única string
  display_timezone = "America/Sao_Paulo" # Define o fuso horário correto
  message          = "Silenciando alertas fora do horário comercial (19h às 9h diariamente)."

  monitor_identifier {
    monitor_tags = ["team:finops-test"] # Aplica-se apenas aos monitores com esta tag
  }

  recurring_schedule {
    timezone = "America/Sao_Paulo"

    recurrence {
      rrule    = "FREQ=DAILY;INTERVAL=1;BYHOUR=19,20,21,22,23,0,1,2,3,4,5,6,7,8" # Define os horários de 19h às 9h
      duration = "14h"                       # Duração total do downtime (14 horas)
    }
  }
}













