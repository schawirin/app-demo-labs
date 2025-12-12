# 🐕 Datadog APM Lab - AWS Lambda Python

[![Terraform](https://img.shields.io/badge/Terraform-1.0+-purple)](https://www.terraform.io/)
[![Python](https://img.shields.io/badge/Python-3.12-blue)](https://www.python.org/)
[![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-orange)](https://aws.amazon.com/lambda/)
[![Datadog](https://img.shields.io/badge/Datadog-APM-blueviolet)](https://www.datadoghq.com/)

Lab completo para demonstrar **Datadog APM, Logs e Traces** em AWS Lambda Python **sem modificar código da aplicação**.

---

## 🎯 O que este repositório oferece

- ✅ **Lambda Python 3.12** com código limpo (sem bibliotecas Datadog)
- ✅ **Terraform completo** para deploy com Datadog Layers
- ✅ **5 payloads de teste** (health, order, HTTP, fibonacci, error)
- ✅ **Documentação completa** para clientes e implementação
- ✅ **Checklist de validação**
- ✅ **Guia antes/depois** para mostrar mudanças

---

## 🚀 Quick Start

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd python-lambda-datadog-lab
```

### 2. Configure credenciais

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
vim terraform.tfvars  # Adicione DD_API_KEY e Layer ARNs
```

### 3. Deploy

```bash
terraform init
terraform apply
```

### 4. Teste

```bash
cd ..
aws lambda invoke \
  --function-name datadog-apm-lab-python \
  --payload file://payloads/health.json \
  --region us-east-1 \
  response.json
```

### 5. Veja no Datadog

- **APM:** https://app.datadoghq.com/apm/services
- **Logs:** https://app.datadoghq.com/logs

---

## 📁 Estrutura do Repositório

```
.
├── 📚 Documentação
│   ├── INDICE.md              # ⭐ Comece aqui!
│   ├── RESUMO-EXECUTIVO.md    # Email template para cliente
│   ├── SETUP-CLIENTE.md       # Guia completo
│   ├── ANTES-DEPOIS.md        # Comparação visual
│   ├── CHECKLIST.md           # Validação
│   ├── QUICKSTART.md          # Setup rápido
│   └── DATADOG-DOCS.md        # Links oficiais
│
├── 🐍 Lambda Function
│   └── lambda/
│       └── handler.py         # SEM código Datadog!
│
├── ☁️ Infraestrutura
│   └── terraform/
│       ├── main.tf            # Lambda + Datadog config
│       ├── variables.tf
│       ├── outputs.tf
│       └── terraform.tfvars.example
│
└── 🧪 Payloads de Teste
    └── payloads/
        ├── health.json
        ├── process-order.json
        ├── fetch-data.json
        ├── calculate.json
        └── simulate-error.json
```

---

## 📖 Documentação

### Para Clientes

- 📧 **[RESUMO-EXECUTIVO.md](RESUMO-EXECUTIVO.md)** - Template de email
- 📖 **[SETUP-CLIENTE.md](SETUP-CLIENTE.md)** - Guia completo de implementação
- 🔄 **[ANTES-DEPOIS.md](ANTES-DEPOIS.md)** - Comparação do que muda

### Para Implementação

- ⚡ **[QUICKSTART.md](QUICKSTART.md)** - Setup em 10 minutos
- ✅ **[CHECKLIST.md](CHECKLIST.md)** - Validação passo a passo
- 📚 **[INDICE.md](INDICE.md)** - Índice completo

### Referência

- 📋 **[README.md](README.md)** - Documentação técnica do lab
- 🔗 **[DATADOG-DOCS.md](DATADOG-DOCS.md)** - Links oficiais Datadog

---

## 🔑 Pré-requisitos

- **AWS Account** com acesso para criar Lambda functions
- **Datadog Account** ativo
- **Terraform** >= 1.0
- **AWS CLI** configurado
- **Python** 3.12 (para desenvolvimento local)

---

## ⚙️ Configuração Detalhada

### 1. Obter Datadog Credentials

#### API Key
```
Datadog → Organization Settings → API Keys
```

#### Layer ARNs (us-east-1, Python 3.12)
```
Extension: arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67
Python:    arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114
```

Outras regiões: https://docs.datadoghq.com/serverless/libraries_integrations/extension/

### 2. Configurar Terraform

Edite `terraform/terraform.tfvars`:

```hcl
datadog_api_key = "sua_api_key_aqui"
datadog_site    = "datadoghq.com"

datadog_extension_layer_arn = "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67"
datadog_python_layer_arn    = "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114"

dd_env     = "lab"
dd_service = "lambda-python-lab"
dd_version = "1.0.0"
```

### 3. Deploy

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### 4. Testar

```bash
# Health check
aws lambda invoke \
  --function-name datadog-apm-lab-python \
  --payload file://payloads/health.json \
  --region us-east-1 \
  response.json

# Process order
aws lambda invoke \
  --function-name datadog-apm-lab-python \
  --payload file://payloads/process-order.json \
  --region us-east-1 \
  response.json

# Fetch data (HTTP trace)
aws lambda invoke \
  --function-name datadog-apm-lab-python \
  --payload file://payloads/fetch-data.json \
  --region us-east-1 \
  response.json
```

---

## 📊 O que você verá no Datadog

### APM
- ✅ Traces automáticos de cada invocação
- ✅ Cold start vs Warm start
- ✅ Latência detalhada (p50, p95, p99)
- ✅ Throughput e taxa de erro
- ✅ Service map
- ✅ HTTP requests rastreados (httpbin.org)

### Logs
- ✅ Logs estruturados
- ✅ Correlação automática com traces (`dd.trace_id`)
- ✅ Request IDs
- ✅ Stack traces de erros

### Métricas
- ✅ `aws.lambda.enhanced.*` metrics
- ✅ Cold start duration
- ✅ Estimated cost
- ✅ Error rate

---

## 🎯 Diferencial: Zero Código

### ❌ O que NÃO precisa fazer

- Modificar código Python
- Adicionar `import datadog`
- Instalar bibliotecas extras
- Alterar lógica da aplicação

### ✅ O que precisa fazer

- Adicionar 2 Layers (Terraform)
- Configurar handler wrapper (Terraform)
- Adicionar environment variables (Terraform)

**Total:** 3 mudanças no Terraform, 0 no código!

---

## 🧪 Payloads Disponíveis

### 1. Health Check
```json
{ "action": "health" }
```

### 2. Process Order
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

### 3. Fetch External Data (HTTP Trace)
```json
{
  "action": "fetch_data",
  "data": { "url": "https://httpbin.org/json" }
}
```

### 4. Calculate Fibonacci (CPU)
```json
{
  "action": "calculate",
  "data": { "operation": "fibonacci", "n": 30 }
}
```

### 5. Simulate Error
```json
{
  "action": "error",
  "data": { "type": "validation" }
}
```

---

## 🧹 Cleanup

Para destruir a infraestrutura:

```bash
cd terraform
terraform destroy
```

---

## 🐛 Troubleshooting

### Traces não aparecem

**Problema:** "No Trace" no Datadog

**Solução:**
```hcl
handler = "datadog_lambda.handler.handler"  # ✅ Correto
DD_LAMBDA_HANDLER = "handler.lambda_handler"
```

### Logs não aparecem

**Solução:**
```hcl
DD_LOGS_INJECTION = "true"
DD_SERVERLESS_LOGS_ENABLED = "true"
```

### Layer ARN inválido

**Solução:**
- Verifique a região (deve ser igual à da Lambda)
- Use versões mais recentes dos layers
- Consulte: https://docs.datadoghq.com/serverless/libraries_integrations/extension/

### Dados não aparecem

**Checklist:**
1. ✅ DD_API_KEY correta?
2. ✅ DD_SITE correto?
3. ✅ Layers adicionados?
4. ✅ Handler configurado?
5. ✅ Aguardou 1-2 minutos?

Ver [CHECKLIST.md](CHECKLIST.md) completo.

---

## 📚 Documentação Oficial

- **[Serverless Monitoring](https://docs.datadoghq.com/serverless/)**
- **[Python Lambda](https://docs.datadoghq.com/serverless/installation/python/)**
- **[Lambda Extension](https://docs.datadoghq.com/serverless/libraries_integrations/extension/)**
- **[Layer ARNs](https://docs.datadoghq.com/serverless/libraries_integrations/extension/#python)**

---

## 🤝 Contribuindo

Este é um lab de demonstração. Sinta-se à vontade para:

- 🍴 Fork o repositório
- 🐛 Reportar issues
- 💡 Sugerir melhorias
- 📝 Melhorar documentação

---

## 📄 Licença

MIT License - Use livremente para demos e implementações!

---

## 👤 Autor

**Pedro Schawirin**
- Datadog Solutions Engineer
- 📧 pedro.schawirin@datadoghq.com

---

## 🌟 Features

- [x] Lambda Python 3.12
- [x] Datadog APM com traces automáticos
- [x] Logs correlacionados
- [x] Error tracking
- [x] Distributed tracing (HTTP)
- [x] Enhanced metrics
- [x] Terraform completo
- [x] Documentação em português
- [x] 5 payloads de teste
- [x] Checklist de validação
- [x] Guias para cliente
- [x] Zero modificação de código

---

## 📈 Próximos Passos

Após implementar este lab:

1. ✅ Criar dashboards customizados
2. ✅ Configurar alertas (latência, erros)
3. ✅ Expandir para outras Lambdas
4. ✅ Integrar com API Gateway
5. ✅ Adicionar DynamoDB/RDS traces
6. ✅ Implementar RUM para frontend

---

## ⭐ Se este lab foi útil

- ⭐ Star este repositório
- 🔄 Compartilhe com sua equipe
- 📧 Envie feedback

---

**Última atualização:** Dezembro 2024
**Versão:** 1.0.0
