# 📚 Documentação Datadog - Serverless/Lambda

Links para documentação oficial do Datadog para AWS Lambda.

---

## 🚀 AWS Lambda Monitoring

### Getting Started
- **[Serverless Monitoring Overview](https://docs.datadoghq.com/serverless/)**
- **[AWS Lambda Monitoring](https://docs.datadoghq.com/serverless/aws_lambda/)**
- **[Installation Overview](https://docs.datadoghq.com/serverless/installation/)**

---

## 🐍 Python Lambda

### Setup
- **[Python Lambda Setup](https://docs.datadoghq.com/serverless/installation/python/)**
- **[Configuration](https://docs.datadoghq.com/serverless/configuration/)**
- **[Instrumentation](https://docs.datadoghq.com/serverless/libraries_integrations/plugin/)**

### Code Examples
```python
# Automatic instrumentation via Layer
# Nenhum código adicional necessário!

# Custom instrumentation (opcional)
from ddtrace import tracer

@tracer.wrap()
def my_function():
    # Your code
    pass
```

📄 **Docs**: https://docs.datadoghq.com/serverless/installation/python/

---

## 📦 Datadog Lambda Extension & Layers

### Lambda Extension
- **[Datadog Lambda Extension](https://docs.datadoghq.com/serverless/libraries_integrations/extension/)**
- **[Extension vs Forwarder](https://docs.datadoghq.com/serverless/libraries_integrations/extension/#choosing-the-extension-or-forwarder)**
- **[Extension Configuration](https://docs.datadoghq.com/serverless/libraries_integrations/extension/#configuring-the-extension)**

### Layer ARNs
- **[Python Layer ARNs](https://docs.datadoghq.com/serverless/libraries_integrations/extension/#python)**

**Formato:**
```
arn:aws:lambda:<REGION>:464622532012:layer:Datadog-Extension:<VERSION>
arn:aws:lambda:<REGION>:464622532012:layer:Datadog-Python312:<VERSION>
```

**Exemplo (us-east-1):**
```
arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:62
arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:106
```

📄 **Lista completa**: https://docs.datadoghq.com/serverless/libraries_integrations/extension/

---

## ⚙️ Configuration

### Environment Variables

**Obrigatórias:**
```bash
DD_API_KEY=<sua_api_key>
DD_SITE=datadoghq.com
```

**Recomendadas:**
```bash
DD_ENV=production
DD_SERVICE=my-lambda-service
DD_VERSION=1.0.0
DD_TRACE_ENABLED=true
DD_LOGS_INJECTION=true
DD_SERVERLESS_LOGS_ENABLED=true
DD_ENHANCED_METRICS=true
```

📄 **Docs**: https://docs.datadoghq.com/serverless/configuration/

---

## 📊 APM & Tracing

### Distributed Tracing
- **[Distributed Tracing](https://docs.datadoghq.com/serverless/distributed_tracing/)**
- **[Trace Merging](https://docs.datadoghq.com/serverless/distributed_tracing/#trace-merging)**
- **[Trace Propagation](https://docs.datadoghq.com/serverless/distributed_tracing/#trace-propagation)**

### Custom Instrumentation
```python
from ddtrace import tracer

# Custom span
with tracer.trace("custom.operation") as span:
    span.set_tag("user.id", "12345")
    # Your code
```

📄 **Docs**: https://docs.datadoghq.com/tracing/trace_collection/custom_instrumentation/python/

---

## 📝 Logs

### Log Collection
- **[Lambda Log Collection](https://docs.datadoghq.com/serverless/aws_lambda/logs/)**
- **[Logs and Traces Correlation](https://docs.datadoghq.com/serverless/aws_lambda/logs/#logs-and-traces-correlation)**
- **[Log Forwarding](https://docs.datadoghq.com/serverless/forwarder/)**

### Log Injection
```python
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Com DD_LOGS_INJECTION=true, logs incluem automaticamente:
# - dd.trace_id
# - dd.span_id
# - dd.service
# - dd.env
# - dd.version

logger.info("User action", extra={"user_id": "12345"})
```

📄 **Docs**: https://docs.datadoghq.com/tracing/other_telemetry/connect_logs_and_traces/python/

---

## 📈 Metrics

### Enhanced Metrics
- **[Enhanced Lambda Metrics](https://docs.datadoghq.com/serverless/enhanced_lambda_metrics/)**
- **[Custom Metrics](https://docs.datadoghq.com/serverless/custom_metrics/)**

**Métricas Enhanced:**
- `aws.lambda.enhanced.invocations`
- `aws.lambda.enhanced.errors`
- `aws.lambda.enhanced.duration`
- `aws.lambda.enhanced.billed_duration`
- `aws.lambda.enhanced.init_duration`
- `aws.lambda.enhanced.estimated_cost`

**Custom Metrics:**
```python
from datadog_lambda.metric import lambda_metric

lambda_metric(
    "custom.metric",
    123,
    tags=["env:prod", "team:backend"]
)
```

📄 **Docs**: https://docs.datadoghq.com/serverless/custom_metrics/?tab=python

---

## ❌ Error Tracking

### Serverless Error Tracking
- **[Error Tracking](https://docs.datadoghq.com/serverless/aws_lambda/error_tracking/)**
- **[Error Tracking Issues](https://docs.datadoghq.com/error_tracking/)**

**Recursos:**
- ✅ Stack traces completos
- ✅ Agrupamento automático de erros
- ✅ Source code integration
- ✅ Correlação com traces

📄 **Docs**: https://docs.datadoghq.com/serverless/aws_lambda/error_tracking/

---

## 🔧 Integrations

### AWS Services
- **[API Gateway](https://docs.datadoghq.com/serverless/aws_lambda/integrations/?tab=apigateway)**
- **[DynamoDB](https://docs.datadoghq.com/integrations/amazon_dynamodb/)**
- **[S3](https://docs.datadoghq.com/integrations/amazon_s3/)**
- **[SQS](https://docs.datadoghq.com/integrations/amazon_sqs/)**
- **[SNS](https://docs.datadoghq.com/integrations/amazon_sns/)**
- **[EventBridge](https://docs.datadoghq.com/integrations/amazon_eventbridge/)**

### HTTP Libraries
Auto-instrumentação para:
- `urllib`
- `urllib3`
- `requests`
- `aiohttp`
- `httpx`

📄 **Docs**: https://docs.datadoghq.com/tracing/setup_overview/compatibility_requirements/python/

---

## 🏗️ Infrastructure as Code

### Terraform
- **[Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function)**
- **[Lambda Layers](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_layer_version)**

**Exemplo:**
```hcl
resource "aws_lambda_function" "example" {
  function_name = "my-function"
  runtime       = "python3.12"

  layers = [
    "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:62",
    "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:106"
  ]

  environment {
    variables = {
      DD_API_KEY    = var.datadog_api_key
      DD_SITE       = "datadoghq.com"
      DD_ENV        = "production"
      DD_SERVICE    = "my-service"
      DD_VERSION    = "1.0.0"
    }
  }
}
```

### Serverless Framework
- **[Serverless Framework Plugin](https://docs.datadoghq.com/serverless/libraries_integrations/plugin/)**

### AWS SAM
- **[AWS SAM](https://docs.datadoghq.com/serverless/installation/python/?tab=awssam)**

### CDK
- **[AWS CDK](https://docs.datadoghq.com/serverless/installation/python/?tab=awscdk)**

---

## 🔍 Monitoring & Alerting

### Monitors
- **[Lambda Monitors](https://docs.datadoghq.com/monitors/types/apm/)**
- **[Creating Monitors](https://docs.datadoghq.com/monitors/create/)**

**Exemplos de alertas:**
- Error rate > 5%
- p99 latency > 1000ms
- Cold start duration > 2s
- Invocation count spike

### Dashboards
- **[Lambda Dashboards](https://docs.datadoghq.com/serverless/aws_lambda/)**
- **[Custom Dashboards](https://docs.datadoghq.com/dashboards/)**

📄 **Docs**: https://docs.datadoghq.com/monitors/

---

## 🐛 Debugging & Troubleshooting

### Common Issues
- **[Troubleshooting](https://docs.datadoghq.com/serverless/troubleshooting/)**
- **[Missing Traces](https://docs.datadoghq.com/serverless/troubleshooting/#traces)**
- **[Missing Logs](https://docs.datadoghq.com/serverless/troubleshooting/#logs)**
- **[Missing Metrics](https://docs.datadoghq.com/serverless/troubleshooting/#metrics)**

### Debug Mode
```bash
# Enable debug logging
DD_LOG_LEVEL=debug
DD_TRACE_DEBUG=true
```

📄 **Docs**: https://docs.datadoghq.com/serverless/troubleshooting/

---

## 🔐 Security & Compliance

### API Key Management
- **[API Keys](https://docs.datadoghq.com/account_management/api-app-keys/)**
- **[AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)**

**Exemplo com Secrets Manager:**
```hcl
data "aws_secretsmanager_secret_version" "datadog_api_key" {
  secret_id = "datadog/api_key"
}

resource "aws_lambda_function" "example" {
  environment {
    variables = {
      DD_API_KEY_SECRET_ARN = data.aws_secretsmanager_secret_version.datadog_api_key.arn
    }
  }
}
```

---

## 📖 Best Practices

### Lambda Best Practices
- **[Serverless Best Practices](https://docs.datadoghq.com/serverless/best_practices/)**
- **[Cold Start Optimization](https://docs.datadoghq.com/serverless/aws_lambda/configuration_optimization/)**
- **[Memory and Timeout](https://docs.datadoghq.com/serverless/aws_lambda/configuration_optimization/#memory-and-timeout)**

**Dicas:**
1. ✅ Use versões mais recentes dos layers
2. ✅ Configure DD_SERVICE, DD_ENV, DD_VERSION
3. ✅ Habilite enhanced metrics
4. ✅ Use log injection para correlação
5. ✅ Configure retention de logs
6. ✅ Monitore cold starts
7. ✅ Use provisioned concurrency se necessário

📄 **Docs**: https://docs.datadoghq.com/serverless/best_practices/

---

## 🎓 Learning Resources

### Tutorials
- **[Serverless Tutorial](https://docs.datadoghq.com/serverless/getting_started/)**
- **[Python Tutorial](https://docs.datadoghq.com/tracing/guide/tutorial-enable-python-containers/)**

### Videos & Webinars
- **[Datadog YouTube](https://www.youtube.com/@Datadoghq)**
- **[Serverless Webinars](https://www.datadoghq.com/resources/?s=serverless)**

### Blog Posts
- **[Datadog Blog - Serverless](https://www.datadoghq.com/blog/tag/serverless/)**
- **[AWS Lambda Best Practices](https://www.datadoghq.com/blog/aws-lambda-best-practices/)**

---

## 🔗 Quick Links

| Recurso | URL |
|---------|-----|
| **Serverless Docs** | https://docs.datadoghq.com/serverless/ |
| **Python Lambda** | https://docs.datadoghq.com/serverless/installation/python/ |
| **Layer ARNs** | https://docs.datadoghq.com/serverless/libraries_integrations/extension/ |
| **Configuration** | https://docs.datadoghq.com/serverless/configuration/ |
| **Troubleshooting** | https://docs.datadoghq.com/serverless/troubleshooting/ |
| **API Keys** | https://app.datadoghq.com/organization-settings/api-keys |

---

## 📱 Datadog Sites

| Site | DD_SITE | URL |
|------|---------|-----|
| US1 | `datadoghq.com` | https://app.datadoghq.com |
| US3 | `us3.datadoghq.com` | https://us3.datadoghq.com |
| US5 | `us5.datadoghq.com` | https://us5.datadoghq.com |
| EU1 | `datadoghq.eu` | https://app.datadoghq.eu |
| AP1 | `ap1.datadoghq.com` | https://ap1.datadoghq.com |

---

## 📞 Support

- **Documentation**: https://docs.datadoghq.com/
- **Support**: support@datadoghq.com
- **Status Page**: https://status.datadoghq.com/
- **Community**: https://github.com/DataDog

---

**Última atualização**: Dezembro 2024

Para documentação sempre atualizada, consulte: https://docs.datadoghq.com/serverless/
