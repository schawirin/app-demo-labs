env = "hext"

services = [
  {
    name             = "mq-receiver"
    framework        = "java"
    trace_metric     = "trace.servlet.request"
    ecs_service_name = "mdl-mq-receiver-svc-hext"
  }
]


ecs_cluster = "lqdchext"
latency_threshold    = 2.5
error_rate_threshold = 20


