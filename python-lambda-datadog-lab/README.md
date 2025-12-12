# 🔬 Lab: AWS Lambda + Datadog APM (Python 3.12)

Lab completo para demonstração de **Datadog APM e Logs** em AWS Lambda com Python 3.12 usando Datadog Lambda Extension Layer.

## 📋 Objetivo do Lab

Demonstrar:
- ✅ Instrumentação de Lambda com Datadog Layer (sem código adicional)
- ✅ APM Traces automáticos
- ✅ Logs correlacionados com traces
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ HTTP requests tracking

## 🏗️ Arquitetura

```
┌─────────────────────────┐
│   AWS Lambda            │
│   Python 3.12           │
│                         │
│   ┌─────────────────┐   │
│   │  handler.py     │   │
│   │  (sem DD code)  │   │
│   └─────────────────┘   │
│                         │
│   ┌─────────────────┐   │
│   │ Datadog Layer   │   │  ──→  Datadog
│   │ - Extension     │   │
│   │ - Python Lib    │   │
│   └─────────────────┘   │
└─────────────────────────┘
```

## 📁 Estrutura do Projeto

```
python-lambda-datadog-lab/
├── lambda/
│   └── handler.py              # Função Lambda (SEM bibliotecas Datadog)
│
├── terraform/
│   ├── main.tf                 # Infraestrutura (Lambda + Layers)
│   ├── variables.tf            # Variáveis configuráveis
│   ├── outputs.tf              # Outputs úteis
│   ├── terraform.tfvars.example # Exemplo de configuração
│   └── .gitignore
│
├── payloads/                   # Payloads de teste
│   ├── process-order.json
│   ├── fetch-data.json
│   ├── calculate.json
│   ├── simulate-error.json
│   └── health.json
│
└── README.md                   # Este arquivo
```

## 🚀 Setup

### Pré-requisitos

- AWS CLI configurado
- Terraform >= 1.0
- Conta no Datadog
- Datadog API Key

### 1. Obter Datadog API Key

1. Acesse: **Organization Settings → API Keys**
2. Crie ou copie uma **API Key**

### 2. Obter ARNs dos Datadog Layers

Acesse: https://docs.datadoghq.com/serverless/libraries_integrations/extension/

**Para Python 3.12 (us-east-1):**

- **Datadog Extension Layer:**
  ```
  arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:62
  ```
  (Substitua `62` pela versão mais recente)

- **Datadog Python Layer:**
  ```
  arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:106
  ```
  (Substitua `106` pela versão mais recente)

**Para outras regiões:** Consulte a documentação acima.

### 3. Configurar Terraform

```bash
cd terraform

# Copie o exemplo de variáveis
cp terraform.tfvars.example terraform.tfvars

# Edite terraform.tfvars
vim terraform.tfvars
```

**Configure no terraform.tfvars:**

```hcl
# AWS
aws_region = "us-east-1"

# Datadog
datadog_api_key = "sua_api_key_aqui"
datadog_site    = "datadoghq.com"

dd_env     = "lab"
dd_service = "lambda-python-lab"
dd_version = "1.0.0"

# Layer ARNs (use versões mais recentes)
datadog_extension_layer_arn = "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:62"
datadog_python_layer_arn    = "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:106"
```

### 4. Deploy com Terraform

```bash
cd terraform

# Inicialize o Terraform
terraform init

# Veja o plano de execução
terraform plan

# Aplique a infraestrutura
terraform apply

# Confirme digitando: yes
```

**Output esperado:**
```
lambda_function_name = "datadog-apm-lab-python"
lambda_function_url  = "https://xxxxx.lambda-url.us-east-1.on.aws/"
invoke_command       = "aws lambda invoke ..."
```

## 🧪 Testando o Lab

### Opção 1: AWS CLI

```bash
# Health check
aws lambda invoke \
  --function-name datadog-apm-lab-python \
  --payload file://payloads/health.json \
  response.json

cat response.json | jq
```

```bash
# Processar pedido
aws lambda invoke \
  --function-name datadog-apm-lab-python \
  --payload file://payloads/process-order.json \
  response.json

cat response.json | jq
```

```bash
# Fetch external data (gera HTTP traces)
aws lambda invoke \
  --function-name datadog-apm-lab-python \
  --payload file://payloads/fetch-data.json \
  response.json
```

```bash
# Calcular Fibonacci (CPU intensive)
aws lambda invoke \
  --function-name datadog-apm-lab-python \
  --payload file://payloads/calculate.json \
  response.json
```

```bash
# Simular erro
aws lambda invoke \
  --function-name datadog-apm-lab-python \
  --payload file://payloads/simulate-error.json \
  response.json
```

### Opção 2: Function URL (HTTP)

Se você habilitou Function URL (configuração padrão):

```bash
# Obtenha a URL
terraform output lambda_function_url

# Invoque via curl
curl -X POST https://xxxxx.lambda-url.us-east-1.on.aws/ \
  -H "Content-Type: application/json" \
  -d @payloads/health.json
```

### Opção 3: AWS Console

1. Acesse AWS Lambda Console
2. Selecione a função `datadog-apm-lab-python`
3. Vá em **Test**
4. Cole o conteúdo de um payload JSON
5. Clique em **Test**

## 📊 Ver Dados no Datadog

### APM Traces

1. Acesse: **APM → Services**
2. Procure por: `lambda-python-lab`
3. Clique no serviço

**O que você verá:**
- ✅ Traces de cada invocação
- ✅ Latência (cold start vs warm start)
- ✅ Throughput (invocações/segundo)
- ✅ Taxa de erro
- ✅ Service map
- ✅ HTTP requests externos (httpbin.org)

### Logs

1. Acesse: **Logs → Search**
2. Filtre por: `service:lambda-python-lab`

**O que você verá:**
- ✅ Logs estruturados
- ✅ `dd.trace_id` e `dd.span_id` correlacionados
- ✅ Request ID da Lambda
- ✅ Severidade (INFO, ERROR, etc)

### Correlação Logs ↔ Traces

1. No APM, abra um **Trace**
2. Role até a seção **Logs**
3. Veja todos os logs dessa invocação
4. Ou clique em um log para ver o trace completo

### Error Tracking

1. Acesse: **APM → Error Tracking**
2. Filtre por: `service:lambda-python-lab`
3. Veja erros agrupados com stack traces

## 🎯 Ações Disponíveis

A função Lambda suporta estas ações:

### 1. `process_order`
Processa um pedido com validação e cálculos.

**Payload:** `payloads/process-order.json`
```json
{
  "action": "process_order",
  "data": {
    "order_id": "ORD-12345",
    "customer_id": "CUST-789",
    "items": [...]
  }
}
```

### 2. `fetch_data`
Faz requisição HTTP externa (gera traces de rede).

**Payload:** `payloads/fetch-data.json`
```json
{
  "action": "fetch_data",
  "data": {
    "url": "https://httpbin.org/json"
  }
}
```

### 3. `calculate`
Operação CPU-intensive (Fibonacci).

**Payload:** `payloads/calculate.json`
```json
{
  "action": "calculate",
  "data": {
    "operation": "fibonacci",
    "n": 30
  }
}
```

### 4. `error`
Simula diferentes tipos de erros.

**Payload:** `payloads/simulate-error.json`
```json
{
  "action": "error",
  "data": {
    "type": "validation"  // validation, not_found, timeout, generic
  }
}
```

### 5. `health`
Health check simples.

**Payload:** `payloads/health.json`
```json
{
  "action": "health"
}
```

## 📝 Logs e CloudWatch

### Ver logs no CloudWatch

```bash
# Tail logs em tempo real
aws logs tail /aws/lambda/datadog-apm-lab-python --follow

# Últimos 10 minutos
aws logs tail /aws/lambda/datadog-apm-lab-python \
  --since 10m \
  --format short
```

### Ver logs no Datadog

```bash
# Filtro básico
service:lambda-python-lab

# Por severidade
service:lambda-python-lab status:error

# Por trace ID
service:lambda-python-lab @dd.trace_id:123456789
```

## 🔍 Métricas Importantes

No Datadog, procure por estas métricas:

### Lambda Metrics
- `aws.lambda.invocations`
- `aws.lambda.duration`
- `aws.lambda.errors`
- `aws.lambda.concurrent_executions`

### Datadog Enhanced Metrics
- `aws.lambda.enhanced.invocations`
- `aws.lambda.enhanced.errors`
- `aws.lambda.enhanced.duration`

### Custom Metrics (se adicionar)
- Criadas via: `lambda_metric("custom.metric", 123)`

## 🎬 Demonstração Passo a Passo

### 1. Mostrar Lambda sem Datadog
- Deploy inicial
- Mostrar que não há código Datadog no handler.py
- Enfatizar: **ZERO código adicional**

### 2. Adicionar Layer via Terraform
- Mostrar terraform.tfvars
- Destacar: apenas ARNs dos layers
- `terraform apply`

### 3. Invocar funções
```bash
# Invoque várias vezes
for i in {1..5}; do
  aws lambda invoke \
    --function-name datadog-apm-lab-python \
    --payload file://payloads/process-order.json \
    response-$i.json
  sleep 1
done
```

### 4. Mostrar no Datadog
- APM: traces aparecendo automaticamente
- Logs: correlacionados com traces
- Service Map: Lambda + HTTP calls
- Error Tracking: erros capturados

### 5. Simular cenários
```bash
# Erro
aws lambda invoke ... --payload file://payloads/simulate-error.json

# Slow request
# (modifique process-order.json: "simulate_delay": 5)

# HTTP call
aws lambda invoke ... --payload file://payloads/fetch-data.json
```

### 6. Mostrar correlação
- No trace, clique em "View Logs"
- Nos logs, clique em um log para ver o trace
- Distributed tracing: Lambda → httpbin.org

## 🧹 Cleanup

Para destruir a infraestrutura:

```bash
cd terraform
terraform destroy
```

Digite `yes` para confirmar.

## 📚 Documentação Oficial

### Datadog Serverless
- **[Lambda Monitoring](https://docs.datadoghq.com/serverless/aws_lambda/)**
- **[Python Lambda](https://docs.datadoghq.com/serverless/installation/python/)**
- **[Lambda Extension](https://docs.datadoghq.com/serverless/libraries_integrations/extension/)**
- **[Layer ARNs](https://docs.datadoghq.com/serverless/libraries_integrations/extension/#python)**

### Terraform
- **[AWS Lambda Resource](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function)**

## 🔧 Troubleshooting

### Lambda não invoca
```bash
# Verifique IAM role
aws lambda get-function --function-name datadog-apm-lab-python

# Veja logs de erro
aws logs tail /aws/lambda/datadog-apm-lab-python --since 10m
```

### Dados não aparecem no Datadog
- Verifique DD_API_KEY nas environment variables
- Confirme DD_SITE correto
- Aguarde até 2 minutos
- Veja logs: `aws logs tail ...`

### Layer ARN inválido
- Verifique a região (deve corresponder à região do Lambda)
- Use a versão mais recente do layer
- Consulte: https://docs.datadoghq.com/serverless/libraries_integrations/extension/

### Erros de permissão
- Verifique IAM role da Lambda
- Confirme que tem permissões de CloudWatch Logs

## 💡 Dicas

1. **Cold Start:** Primeira invocação é mais lenta (inicialização)
2. **Warm Start:** Invocações subsequentes são mais rápidas
3. **Timeout:** Configure timeout adequado (default: 30s)
4. **Memory:** Mais memória = mais CPU = mais rápido
5. **Layers:** Use sempre as versões mais recentes

## 🎯 Próximos Passos

- [ ] Adicionar API Gateway
- [ ] Conectar com DynamoDB
- [ ] Adicionar SQS/SNS
- [ ] Custom metrics
- [ ] Distributed tracing multi-Lambda
- [ ] CI/CD pipeline

## 📞 Suporte

- **Datadog Docs**: https://docs.datadoghq.com/
- **Datadog Support**: support@datadoghq.com

---

**Versão do Lab**: 1.0.0
**Última atualização**: Dezembro 2024
