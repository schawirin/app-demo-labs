terraform {
  required_providers {
    datadog = {
      source  = "DataDog/datadog"
      version = ">= 3.13.0"
    }
  }
}

provider "datadog" {
  api_key = var.datadog_api_key
  app_key = var.datadog_app_key
}

variable "datadog_api_key" {}
variable "datadog_app_key" {}

 resource "datadog_dashboard" "imported_dashboard" {
  title       = "Controle de Utilização de Licenças"
  layout_type = "free"
  
  widget {
    note_definition {
      content          = "Licenças contratadas"
      background_color = "gray"
      font_size        = 16
      text_align       = "center"
      vertical_align   = "center"
      show_tick        = true
      tick_pos         = "50%"
      tick_edge        = "bottom"
    }
    layout {
      x      = 18
      y      = 31
      width  = 13
      height = 7
    }
  }
}
