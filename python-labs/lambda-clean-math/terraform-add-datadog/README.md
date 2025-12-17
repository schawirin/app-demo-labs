# Terraform: Add Datadog to clean-math-lambda

Este Terraform **atualiza** a Lambda `clean-math-lambda` existente para adicionar **Datadog APM, Logs e Metrics** **SEM modificar nenhuma linha de código Python**.

---

## 🎯 O que este Terraform faz

### ✅ Mudanças aplicadas:

1. **Handler:**
   - **ANTES:** `handler.lambda_handler`
   - **DEPOIS:** `datadog_lambda.handler.handler`

2. **Layers adicionados:**
   - Datadog Extension Layer (v67)
   - Datadog Python Layer (v114) for Python 3.12

3. **Environment Variables:**
   ```bash
   DD_API_KEY                 = "***"
   DD_SITE                    = "datadoghq.com"
   DD_ENV                     = "lab"
   DD_SERVICE                 = "clean-math-lambda"
   DD_VERSION                 = "1.0.0"
   DD_TRACE_ENABLED           = "true"
   DD_LOGS_INJECTION          = "true"
   DD_LAMBDA_HANDLER          = "handler.lambda_handler"
   DD_SERVERLESS_LOGS_ENABLED = "true"
   DD_ENHANCED_METRICS        = "true"
   ```

### ❌ O que NÃO muda:

- ✅ Código Python permanece **100% intacto**
- ✅ IAM Role permanece o mesmo
- ✅ Memory, Timeout, Runtime permanecem iguais
- ✅ Nenhum arquivo `.py` é modificado

---

## 🚀 Como Usar

### 1. Configure as credenciais AWS

```bash
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."
```

### 2. Edite o `terraform.tfvars` (se necessário)

```bash
cd python-labs/lambda-clean-math/terraform-add-datadog
vim terraform.tfvars
```

**Já está configurado com:**
- Datadog API Key: `<YOUR_DATADOG_API_KEY>`
- Lambda: `clean-math-lambda`
- Region: `us-east-1`

### 3. Initialize Terraform

```bash
terraform init
```

### 4. Preview changes

```bash
terraform plan
```

**Você verá:**
```
Terraform will perform the following actions:

  # aws_lambda_function.with_datadog will be updated in-place
  ~ handler     = "handler.lambda_handler" -> "datadog_lambda.handler.handler"
  ~ layers      = [] -> [
      + "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67",
      + "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114",
    ]
  ~ environment {
      + DD_API_KEY                 = (sensitive value)
      + DD_SITE                    = "datadoghq.com"
      + DD_TRACE_ENABLED           = "true"
      + DD_LOGS_INJECTION          = "true"
      + DD_LAMBDA_HANDLER          = "handler.lambda_handler"
      ...
    }
```

### 5. Apply changes

```bash
terraform apply
```

Digite `yes` quando solicitado.

---

## 🧪 Testar Após Apply

### 1. Invoke Lambda

```bash
aws lambda invoke \
  --function-name clean-math-lambda \
  --cli-binary-format raw-in-base64-out \
  --payload '{"operation":"fibonacci","number":20}' \
  --region us-east-1 \
  response.json && cat response.json | jq '.'
```

### 2. Verifique no Datadog

**APM Traces:**
```
https://app.datadoghq.com/apm/traces?query=service:clean-math-lambda
```

**Logs:**
```
https://app.datadoghq.com/logs?query=service:clean-math-lambda
```

**Serverless:**
```
https://app.datadoghq.com/functions?cloud=aws&entity_view=lambda_functions
```

---

## 📊 Outputs do Terraform

Após o `terraform apply`, você verá:

```hcl
Outputs:

datadog_config = {
  "dd_env"     = "lab"
  "dd_service" = "clean-math-lambda"
  "dd_site"    = "datadoghq.com"
  "dd_version" = "1.0.0"
}

instrumentation_summary = {
  "code_changes"    = "ZERO"
  "enhanced_metrics" = "true"
  "logs_injection"  = "true"
  "traces_enabled"  = "true"
}

lambda_arn = "arn:aws:lambda:us-east-1:061039767542:function:clean-math-lambda"

layers_applied = [
  "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67",
  "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114",
]

new_handler = "datadog_lambda.handler.handler"

original_handler = "handler.lambda_handler"
```

---

## 🔄 Reverter (Remove Datadog)

Se quiser remover o Datadog:

```bash
# Option 1: Via AWS CLI
aws lambda update-function-configuration \
  --function-name clean-math-lambda \
  --handler handler.lambda_handler \
  --layers [] \
  --environment Variables={}

# Option 2: Terraform destroy
terraform destroy
```

---

## 📁 Arquivos

```
terraform-add-datadog/
├── main.tf              # Terraform configuration
├── variables.tf         # Variable definitions
├── terraform.tfvars     # Variable values (with secrets)
├── .gitignore          # Ignore sensitive files
└── README.md           # This file
```

---

## 🎯 Resultado Final

**ANTES:**
```
Handler: handler.lambda_handler
Layers: []
Env Vars: {}
→ Logs no CloudWatch (basic)
→ Sem traces
→ Métricas básicas do Lambda
```

**DEPOIS:**
```
Handler: datadog_lambda.handler.handler
Layers: [Datadog-Extension, Datadog-Python312]
Env Vars: DD_* (Datadog config)
→ Logs no CloudWatch + Datadog (correlacionados)
→ Traces distribuídos no APM
→ Métricas enhanced + custom
```

**Código Python:** **0 linhas modificadas** ✅

---

## 📚 Referências

- [Datadog Lambda Extension](https://docs.datadoghq.com/serverless/libraries_integrations/extension/)
- [Datadog Python Layer](https://docs.datadoghq.com/serverless/installation/python/)
- [Lambda Layer ARNs](https://github.com/DataDog/datadog-lambda-python/releases)

---

**Pronto para instrumentar sem code changes!** 🚀
