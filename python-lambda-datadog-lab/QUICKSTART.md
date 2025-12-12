# ⚡ Quick Start - Lambda + Datadog Lab

Comece em 10 minutos!

## 1️⃣ Obter Credenciais Datadog

### API Key
1. Acesse: **Organization Settings → API Keys**
2. Copie sua API Key

### Layer ARNs
Acesse: https://docs.datadoghq.com/serverless/libraries_integrations/extension/

**Para us-east-1 (Python 3.12):**
- Extension: `arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:62`
- Python: `arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:106`

(Use versões mais recentes!)

---

## 2️⃣ Configurar Terraform

```bash
cd terraform

# Copie o exemplo
cp terraform.tfvars.example terraform.tfvars

# Edite com suas credenciais
vim terraform.tfvars
```

**Preencha no terraform.tfvars:**
```hcl
datadog_api_key = "sua_api_key_aqui"
datadog_site    = "datadoghq.com"

datadog_extension_layer_arn = "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:62"
datadog_python_layer_arn    = "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:106"
```

---

## 3️⃣ Deploy

```bash
cd terraform

terraform init
terraform apply
# Digite: yes
```

**Output:**
```
lambda_function_name = "datadog-apm-lab-python"
lambda_function_url  = "https://xxxxx.lambda-url.us-east-1.on.aws/"
```

---

## 4️⃣ Testar

```bash
cd ..

# Torne o script executável
chmod +x test-lambda.sh

# Health check
./test-lambda.sh health

# Processar pedido
./test-lambda.sh process-order

# Fetch data (HTTP trace)
./test-lambda.sh fetch-data

# Calcular Fibonacci
./test-lambda.sh calculate

# Simular erro
./test-lambda.sh simulate-error

# Todos os testes
./test-lambda.sh all
```

---

## 5️⃣ Ver no Datadog

### APM
```
https://app.datadoghq.com/apm/services
```
Procure: `lambda-python-lab`

### Logs
```
https://app.datadoghq.com/logs
```
Filtro: `service:lambda-python-lab`

---

## 🎯 O que você verá

### APM
- ✅ Traces automáticos
- ✅ Cold start vs Warm start
- ✅ HTTP requests externos
- ✅ Performance metrics
- ✅ Service map

### Logs
- ✅ Logs estruturados
- ✅ Correlacionados com traces
- ✅ Request IDs
- ✅ Stack traces de erros

### Correlação
- ✅ Logs → Traces
- ✅ Traces → Logs
- ✅ Error tracking

---

## 🧪 Payloads de Teste

### Health Check
```json
{
  "action": "health"
}
```

### Process Order
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

### Fetch External Data
```json
{
  "action": "fetch_data",
  "data": {
    "url": "https://httpbin.org/json"
  }
}
```

### Calculate Fibonacci
```json
{
  "action": "calculate",
  "data": {
    "operation": "fibonacci",
    "n": 30
  }
}
```

### Simulate Error
```json
{
  "action": "error",
  "data": {
    "type": "validation"
  }
}
```

---

## 🔧 Comandos Úteis

### Invocar via AWS CLI
```bash
aws lambda invoke \
  --function-name datadog-apm-lab-python \
  --payload file://payloads/health.json \
  response.json

cat response.json | jq
```

### Ver logs
```bash
# Tail logs (live)
aws logs tail /aws/lambda/datadog-apm-lab-python --follow

# Últimos 10 min
aws logs tail /aws/lambda/datadog-apm-lab-python --since 10m
```

### Invocar via HTTP
```bash
# Obtenha a URL
terraform output lambda_function_url

# Invoque
curl -X POST https://xxxxx.lambda-url.us-east-1.on.aws/ \
  -H "Content-Type: application/json" \
  -d @payloads/health.json
```

---

## 🧹 Cleanup

```bash
cd terraform
terraform destroy
# Digite: yes
```

---

## 🆘 Troubleshooting

### Dados não aparecem
- ✅ Aguarde 1-2 minutos
- ✅ Verifique DD_API_KEY
- ✅ Confirme DD_SITE correto
- ✅ Veja logs: `aws logs tail ...`

### Layer ARN inválido
- ✅ Verifique a região
- ✅ Use versão mais recente
- ✅ Consulte: https://docs.datadoghq.com/serverless/libraries_integrations/extension/

### Permission denied
- ✅ Verifique IAM role
- ✅ Confirme AWS CLI configurado

---

## 📚 Docs Completas

Ver [README.md](README.md) para documentação completa.

---

Pronto! 🚀
