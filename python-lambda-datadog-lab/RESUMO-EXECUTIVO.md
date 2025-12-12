# 📨 Email Template: Datadog APM em Lambda Python

---

**Assunto:** Configuração Datadog APM - Lambda Python (SEM modificar código)

---

Olá,

Segue configuração para habilitar **Datadog APM completo** em suas Lambdas Python **sem modificar nenhuma linha de código**.

## 🎯 O que você vai ter

- ✅ Traces automáticos de todas invocações
- ✅ Logs correlacionados com traces
- ✅ Métricas de performance (latência, throughput, erros)
- ✅ Error tracking automático
- ✅ Distributed tracing de HTTP requests
- ✅ Service map

## 🔧 Configuração (Terraform)

### 1. Obter credenciais

**API Key:** Datadog → Organization Settings → API Keys

**Layers (US-EAST-1, Python 3.12):**
```
arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67
arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114
```

Outras regiões: https://docs.datadoghq.com/serverless/libraries_integrations/extension/

### 2. Modificar Terraform

```hcl
resource "aws_lambda_function" "sua_function" {
  # ... suas configs existentes ...

  # MUDAR handler
  handler = "datadog_lambda.handler.handler"

  # ADICIONAR layers
  layers = [
    "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67",
    "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114"
  ]

  # ADICIONAR environment variables
  environment {
    variables = {
      DD_API_KEY                 = "SUA_API_KEY"
      DD_SITE                    = "datadoghq.com"
      DD_ENV                     = "production"
      DD_SERVICE                 = "nome-do-servico"
      DD_VERSION                 = "1.0.0"
      DD_TRACE_ENABLED           = "true"
      DD_LOGS_INJECTION          = "true"
      DD_LAMBDA_HANDLER          = "handler.lambda_handler"  # ← SEU HANDLER ORIGINAL
      DD_SERVERLESS_LOGS_ENABLED = "true"
      DD_ENHANCED_METRICS        = "true"
      DD_MERGE_XRAY_TRACES       = "false"

      # suas outras variáveis...
    }
  }
}
```

### 3. Aplicar

```bash
terraform plan
terraform apply
```

### 4. Verificar (após 1-2 min)

- **APM:** https://app.datadoghq.com/apm/services
- **Logs:** https://app.datadoghq.com/logs

## ⏱️ Tempo estimado

- **Primeira Lambda:** 15-30 min
- **Lambdas adicionais:** 5 min cada

## ❌ O que NÃO precisa fazer

- Modificar código Python
- Adicionar imports do Datadog
- Instalar bibliotecas extras
- Alterar lógica da aplicação

## 📚 Documentação completa

Anexei guia detalhado com troubleshooting e best practices.

Arquivos:
- `SETUP-CLIENTE.md` - Guia completo passo a passo
- `terraform/` - Exemplo de código Terraform

## 📞 Suporte

Qualquer dúvida, é só falar!

Att,
[Seu Nome]

---

**Links úteis:**
- Docs oficial: https://docs.datadoghq.com/serverless/installation/python/
- Layer ARNs: https://docs.datadoghq.com/serverless/libraries_integrations/extension/
