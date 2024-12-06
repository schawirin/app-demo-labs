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
}

resource "datadog_dashboard" "finops_dashboard" {
  title       = "Monitor Notifications Overview"
  description = "Dashboard para monitorar baixa utilização de recursos no ambiente on-premises."
  layout_type = "ordered"

  widget {
    query_value_definition {
      title = "Baixa Utilização de Memória - Count"
      request {
        formula {
          formula = "query1"
        }
        query {
          q           = "count(last_5m):avg:system.mem.pct_usable{env:onprem} by {host} > 80"
          data_source = "metrics"
        }
      }
    }
  }

  widget {
    toplist_definition {
      title = "Hosts com Baixa Utilização de Memória"
      request {
        q = "avg:system.mem.pct_usable{env:onprem} by {host}"
      }
    }
  }

  widget {
    query_value_definition {
      title = "Baixa Utilização de CPU - Count"
      request {
        formula {
          formula = "query1"
        }
        query {
          q           = "count(last_5m):avg:system.cpu.idle{env:onprem} by {host} > 80"
          data_source = "metrics"
        }
      }
    }
  }

  widget {
    toplist_definition {
      title = "Hosts com Baixa Utilização de CPU"
      request {
        q = "avg:system.cpu.idle{env:onprem} by {host}"
      }
    }
  }

  widget {
    timeseries_definition {
      title = "Tráfego de Rede - Bytes Enviados"
      request {
        q            = "avg:system.net.bytes_sent{env:onprem} by {host}"
        display_type = "line"
        style {
          palette     = "cool"
          line_width  = "normal"
          line_type   = "solid"
        }
      }
    }
  }

  widget {
    timeseries_definition {
      title = "Tráfego de Rede - Bytes Recebidos"
      request {
        q            = "avg:system.net.bytes_rcvd{env:onprem} by {host}"
        display_type = "line"
        style {
          palette     = "warm"
          line_width  = "normal"
          line_type   = "solid"
        }
      }
    }
  }
}
