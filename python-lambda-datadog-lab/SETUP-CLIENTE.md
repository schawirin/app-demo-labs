# 🎯 Guia de Configuração: Datadog APM em AWS Lambda Python

## ✅ O que você vai conseguir

- **APM completo** com traces automáticos
- **Logs correlacionados** com traces
- **Métricas enhanced** da Lambda
- **Error tracking** automático
- **Distributed tracing** de HTTP requests

**SEM MODIFICAR O CÓDIGO DA APLICAÇÃO!**

---

## 📋 Pré-requisitos

1. Lambda function Python 3.12 (ou 3.9, 3.10, 3.11)
2. Conta Datadog ativa
3. Terraform (ou acesso ao console AWS)

---

## 🔑 Passo 1: Obter Credenciais Datadog

### API Key
1. Acesse: **Datadog → Organization Settings → API Keys**
2. Copie ou crie uma nova API Key

### Layer ARNs (Versões mais recentes)
Acesse: https://docs.datadoghq.com/serverless/libraries_integrations/extension/

**Para us-east-1 (Python 3.12):**
```
Extension: arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67
Python:    arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114
```

⚠️ **Importante:** Use as versões mais recentes disponíveis na documentação.

**Para outras regiões:** Consulte a documentação acima.

---

## 🛠️ Passo 2: Configurar Lambda (Terraform)

### 2.1 - Adicionar Layers

```hcl
resource "aws_lambda_function" "sua_function" {
  # ... suas configurações existentes ...

  # ADICIONAR: Layers do Datadog
  layers = [
    "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67",
    "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114"
  ]
}
```

### 2.2 - Configurar Handler Wrapper

```hcl
resource "aws_lambda_function" "sua_function" {
  # MODIFICAR: Handler para usar wrapper do Datadog
  handler = "datadog_lambda.handler.handler"

  # ... resto da configuração ...
}
```

### 2.3 - Adicionar Environment Variables

```hcl
resource "aws_lambda_function" "sua_function" {
  environment {
    variables = {
      # ADICIONAR: Configuração Datadog
      DD_API_KEY                 = "SUA_API_KEY_AQUI"
      DD_SITE                    = "datadoghq.com"  # ou datadoghq.eu, us3.datadoghq.com, etc
      DD_ENV                     = "production"      # ou development, staging, etc
      DD_SERVICE                 = "seu-servico"
      DD_VERSION                 = "1.0.0"
      DD_TRACE_ENABLED           = "true"
      DD_LOGS_INJECTION          = "true"

      # ADICIONAR: Handler original
      DD_LAMBDA_HANDLER          = "seu_arquivo.sua_funcao"  # Ex: handler.lambda_handler

      # ADICIONAR: Settings da Extension
      DD_SERVERLESS_LOGS_ENABLED = "true"
      DD_ENHANCED_METRICS        = "true"
      DD_MERGE_XRAY_TRACES       = "false"

      # Suas outras variáveis existentes...
    }
  }
}
```

### 2.4 - Exemplo Completo

```hcl
resource "aws_lambda_function" "exemplo" {
  filename         = "lambda_function.zip"
  function_name    = "minha-lambda"
  role            = aws_iam_role.lambda_role.arn
  handler         = "datadog_lambda.handler.handler"  # ← Handler wrapper
  runtime         = "python3.12"
  memory_size     = 512
  timeout         = 30

  layers = [
    "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67",
    "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114"
  ]

  environment {
    variables = {
      DD_API_KEY                 = var.datadog_api_key
      DD_SITE                    = "datadoghq.com"
      DD_ENV                     = "production"
      DD_SERVICE                 = "meu-servico"
      DD_VERSION                 = "1.0.0"
      DD_TRACE_ENABLED           = "true"
      DD_LOGS_INJECTION          = "true"
      DD_LAMBDA_HANDLER          = "handler.lambda_handler"  # ← Seu handler original
      DD_SERVERLESS_LOGS_ENABLED = "true"
      DD_ENHANCED_METRICS        = "true"
      DD_MERGE_XRAY_TRACES       = "false"
    }
  }
}
```

---

## 🔧 Passo 3: Aplicar Configuração

### Via Terraform

```bash
# 1. Inicializar (se necessário)
terraform init

# 2. Planejar mudanças
terraform plan

# 3. Aplicar
terraform apply
```

### Via Console AWS (alternativa)

1. Acesse AWS Lambda Console
2. Selecione sua função
3. **Configuration → Environment variables:**
   - Adicione as variáveis DD_*
4. **Code → Layers:**
   - Add layer → Specify ARN
   - Cole o ARN do Datadog-Extension
   - Add layer novamente
   - Cole o ARN do Datadog-Python312
5. **Runtime settings:**
   - Edit → Handler: `datadog_lambda.handler.handler`
   - Environment variables → Adicione: `DD_LAMBDA_HANDLER=seu_handler_original`

---

## ✅ Passo 4: Testar

### Invocar Lambda

```bash
aws lambda invoke \
  --function-name sua-lambda \
  --payload '{"test": "data"}' \
  response.json
```

### Verificar no Datadog

**Aguarde 1-2 minutos**, depois acesse:

1. **APM → Services**
   - Procure pelo nome do serviço (DD_SERVICE)
   - Veja traces, latência, throughput

2. **Logs → Search**
   - Filtro: `service:seu-servico`
   - Veja logs correlacionados com traces

3. **APM → Traces**
   - Veja traces detalhados
   - Spans de HTTP requests
   - Distributed tracing

---

## 📊 O que você verá no Datadog

### APM
- ✅ Traces automáticos de cada invocação
- ✅ Cold start vs Warm start
- ✅ Latência detalhada (p50, p75, p95, p99)
- ✅ Throughput (requests/segundo)
- ✅ Taxa de erro
- ✅ Service map

### Logs
- ✅ Logs estruturados
- ✅ Correlação automática: `dd.trace_id`, `dd.span_id`
- ✅ Um clique para ir do log para o trace
- ✅ Request IDs da Lambda

### Error Tracking
- ✅ Erros capturados automaticamente
- ✅ Stack traces completos
- ✅ Agrupamento inteligente de erros

### Métricas
- ✅ `aws.lambda.enhanced.*` metrics
- ✅ Cold start duration
- ✅ Init duration
- ✅ Runtime duration
- ✅ Estimated cost

---

## ❌ O QUE NÃO PRECISA FAZER

- ❌ **NÃO** modificar o código Python
- ❌ **NÃO** adicionar `import datadog` no código
- ❌ **NÃO** instalar bibliotecas extras
- ❌ **NÃO** alterar a lógica da aplicação

**Tudo é feito via Layers + Environment Variables!**

---

## 🔐 Segurança: API Key

### Opção 1: AWS Secrets Manager (Recomendado)

```hcl
# 1. Criar secret
resource "aws_secretsmanager_secret" "datadog_api_key" {
  name = "datadog/api_key"
}

resource "aws_secretsmanager_secret_version" "datadog_api_key" {
  secret_id     = aws_secretsmanager_secret.datadog_api_key.id
  secret_string = var.datadog_api_key
}

# 2. Dar permissão à Lambda
resource "aws_iam_role_policy" "lambda_secrets" {
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "secretsmanager:GetSecretValue"
      ]
      Resource = aws_secretsmanager_secret.datadog_api_key.arn
    }]
  })
}

# 3. Usar no Lambda
resource "aws_lambda_function" "example" {
  # ...
  environment {
    variables = {
      DD_API_KEY_SECRET_ARN = aws_secretsmanager_secret.datadog_api_key.arn
      # Resto das variáveis...
    }
  }
}
```

### Opção 2: Terraform Variables (Simples)

```hcl
variable "datadog_api_key" {
  type      = string
  sensitive = true
}

resource "aws_lambda_function" "example" {
  environment {
    variables = {
      DD_API_KEY = var.datadog_api_key
    }
  }
}
```

---

## 🌍 Sites do Datadog

Configure `DD_SITE` baseado na sua região:

| Região | DD_SITE |
|--------|---------|
| US East | `datadoghq.com` |
| US West | `us3.datadoghq.com` |
| US Central | `us5.datadoghq.com` |
| Europe | `datadoghq.eu` |
| Asia Pacific | `ap1.datadoghq.com` |
| US FedRAMP | `ddog-gov.com` |

---

## 🐛 Troubleshooting

### Traces não aparecem

**Causa:** Handler não configurado corretamente

**Solução:**
```hcl
handler           = "datadog_lambda.handler.handler"
DD_LAMBDA_HANDLER = "seu_handler_original"  # Ex: handler.lambda_handler
```

### Logs não aparecem

**Causa:** DD_LOGS_INJECTION ou DD_SERVERLESS_LOGS_ENABLED não habilitado

**Solução:**
```hcl
DD_LOGS_INJECTION          = "true"
DD_SERVERLESS_LOGS_ENABLED = "true"
```

### Layer ARN inválido

**Causa:** Região ou versão incorreta

**Solução:**
- Verifique a região (deve ser a mesma da Lambda)
- Use versões mais recentes: https://docs.datadoghq.com/serverless/libraries_integrations/extension/

### Dados não aparecem

**Checklist:**
1. ✅ DD_API_KEY correta?
2. ✅ DD_SITE correto?
3. ✅ Layers adicionados?
4. ✅ Handler configurado como `datadog_lambda.handler.handler`?
5. ✅ DD_LAMBDA_HANDLER aponta para seu handler?
6. ✅ Aguardou 1-2 minutos?

---

## 📚 Referências

- **[Documentação Oficial - Lambda Python](https://docs.datadoghq.com/serverless/installation/python/)**
- **[Layer ARNs](https://docs.datadoghq.com/serverless/libraries_integrations/extension/)**
- **[Configuração](https://docs.datadoghq.com/serverless/configuration/)**
- **[Best Practices](https://docs.datadoghq.com/serverless/best_practices/)**

---

## 📞 Suporte

- **Documentação:** https://docs.datadoghq.com/
- **Suporte Datadog:** support@datadoghq.com
- **Status:** https://status.datadoghq.com/

---

## ✨ Resumo Executivo

### O que fazer:

1. ✅ Obter API Key e Layer ARNs do Datadog
2. ✅ Adicionar 2 Layers na Lambda (Extension + Python)
3. ✅ Mudar handler para `datadog_lambda.handler.handler`
4. ✅ Adicionar environment variables (DD_*)
5. ✅ Deploy e testar

### Resultado:

- 🎯 APM completo com traces automáticos
- 📊 Logs correlacionados
- 📈 Métricas enhanced
- 🐛 Error tracking
- 🔗 Distributed tracing

### Tempo estimado:

- ⏱️ **15-30 minutos** para primeira configuração
- ⏱️ **5 minutos** para Lambdas adicionais

---

**Versão:** 1.0.0
**Última atualização:** Dezembro 2024
