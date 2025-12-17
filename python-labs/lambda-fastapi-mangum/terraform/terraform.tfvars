aws_region   = "us-east-1"
function_name = "fastapi-mangum-test"

# Datadog Configuration
datadog_api_key = "<YOUR_DATADOG_API_KEY>"
datadog_site    = "datadoghq.com"
dd_env          = "lab"
dd_service      = "fastapi-mangum-test"
dd_version      = "1.0.0"

# Layer ARNs
fastapi_layer_arn           = "arn:aws:lambda:us-east-1:061039767542:layer:fastapi-mangum-layer:2"
datadog_extension_layer_arn = "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67"
datadog_python_layer_arn    = "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114"
