# 🔄 Antes e Depois - Configuração Datadog APM

Comparação visual do que muda na configuração da Lambda.

---

## ❌ ANTES (Sem Datadog)

### Terraform Configuration

```hcl
resource "aws_lambda_function" "minha_lambda" {
  filename      = "lambda_function.zip"
  function_name = "minha-lambda"
  role          = aws_iam_role.lambda_role.arn
  handler       = "handler.lambda_handler"        # ← Handler direto
  runtime       = "python3.12"
  memory_size   = 512
  timeout       = 30

  # SEM layers

  environment {
    variables = {
      ENVIRONMENT = "production"
      # Suas variáveis existentes...
    }
  }
}
```

### Python Code (handler.py)

```python
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    logger.info("Processing request")

    # Sua lógica aqui
    result = do_something()

    return {
        'statusCode': 200,
        'body': json.dumps(result)
    }
```

### O que você tem:

- ❌ Sem visibilidade de traces
- ❌ Logs não correlacionados
- ❌ Sem métricas detalhadas
- ❌ Sem error tracking
- ❌ Sem service map

---

## ✅ DEPOIS (Com Datadog)

### Terraform Configuration

```hcl
resource "aws_lambda_function" "minha_lambda" {
  filename      = "lambda_function.zip"
  function_name = "minha-lambda"
  role          = aws_iam_role.lambda_role.arn
  handler       = "datadog_lambda.handler.handler"  # ← Handler wrapper
  runtime       = "python3.12"
  memory_size   = 512
  timeout       = 30

  # ADICIONADO: Datadog Layers
  layers = [
    "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67",
    "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114"
  ]

  environment {
    variables = {
      # ADICIONADO: Configuração Datadog
      DD_API_KEY                 = var.datadog_api_key
      DD_SITE                    = "datadoghq.com"
      DD_ENV                     = "production"
      DD_SERVICE                 = "minha-lambda"
      DD_VERSION                 = "1.0.0"
      DD_TRACE_ENABLED           = "true"
      DD_LOGS_INJECTION          = "true"
      DD_LAMBDA_HANDLER          = "handler.lambda_handler"  # ← Handler original
      DD_SERVERLESS_LOGS_ENABLED = "true"
      DD_ENHANCED_METRICS        = "true"
      DD_MERGE_XRAY_TRACES       = "false"

      # Suas variáveis existentes
      ENVIRONMENT = "production"
    }
  }
}
```

### Python Code (handler.py)

```python
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    logger.info("Processing request")

    # Sua lógica aqui (SEM MUDANÇAS!)
    result = do_something()

    return {
        'statusCode': 200,
        'body': json.dumps(result)
    }
```

### O que você tem agora:

- ✅ **Traces automáticos** de todas invocações
- ✅ **Logs correlacionados** com `dd.trace_id`
- ✅ **Métricas enhanced** (latência, throughput, cold start)
- ✅ **Error tracking** automático com stack traces
- ✅ **Service map** completo
- ✅ **Distributed tracing** de HTTP requests
- ✅ **Performance insights** (p50, p95, p99)

---

## 📊 Resumo das Mudanças

### Terraform

| Item | Antes | Depois |
|------|-------|--------|
| **Handler** | `handler.lambda_handler` | `datadog_lambda.handler.handler` |
| **Layers** | Nenhum | 2 layers Datadog |
| **Env Vars** | Suas vars | Suas vars + 10 vars DD_* |

### Python Code

| Item | Mudança |
|------|---------|
| **Imports** | Nenhuma ❌ |
| **Código** | Nenhuma ❌ |
| **Lógica** | Nenhuma ❌ |

**ZERO alterações no código!** 🎉

---

## 🔍 O que acontece internamente

### Fluxo de Execução

**ANTES:**
```
API Gateway/Event → Lambda Runtime → handler.lambda_handler → Sua lógica
```

**DEPOIS:**
```
API Gateway/Event
  → Lambda Runtime
  → Datadog Layer (carrega)
  → datadog_lambda.handler.handler (wrapper)
    → [Inicia trace]
    → [Injeta context]
    → handler.lambda_handler (seu código)
    → [Captura response]
    → [Finaliza trace]
    → [Envia para Datadog]
  → Response
```

### O que o Wrapper faz:

1. ✅ Inicia trace antes da sua função
2. ✅ Injeta trace context nos logs
3. ✅ Captura exceções automaticamente
4. ✅ Mede duração da execução
5. ✅ Adiciona tags (env, service, version)
6. ✅ Finaliza trace após sua função
7. ✅ Envia dados para Datadog via Extension
8. ✅ **Não interfere na sua lógica!**

---

## 💰 Impacto

### Performance

| Métrica | Impacto |
|---------|---------|
| **Latência** | +1-5ms (overhead mínimo) |
| **Memory** | +~50MB (para layers) |
| **Cold Start** | +100-200ms (primeira invocação) |
| **Warm Starts** | Impacto negligível |

### Custo

| Item | Custo |
|------|-------|
| **Lambda** | Mínimo (overhead pequeno) |
| **Datadog** | Baseado em spans/sessions |
| **Data Transfer** | Negligível |

**ROI:** Geralmente positivo em semanas (redução de MTTR, menos bugs em prod)

---

## 🎯 Valor Entregue

### Antes
```
❌ "A Lambda está lenta, mas não sei porquê"
❌ "Teve um erro, mas não sei qual request"
❌ "Não sei quantas vezes essa função é chamada"
❌ "Não sei se o problema é no meu código ou serviço externo"
```

### Depois
```
✅ "P95 está em 250ms, 80% do tempo é no DynamoDB"
✅ "Erro no request X, stack trace completo aqui"
✅ "1.2M invocações/dia, pico às 14h"
✅ "HTTP request para API externa levou 3s (distributed trace)"
```

---

## 📈 Próximos Passos

Após implementar:

1. **Criar dashboards** personalizados
2. **Configurar alertas** (latência alta, taxa de erro)
3. **Otimizar** baseado nos dados (cold start, queries lentas)
4. **Expandir** para outras Lambdas (copiar config)
5. **Integrar** com outros serviços (APM, RUM, etc)

---

## 🔑 Pontos-Chave

### O que muda:
- ✅ Terraform (layers, handler, env vars)

### O que NÃO muda:
- ❌ Código Python
- ❌ Lógica de negócio
- ❌ Testes unitários
- ❌ CI/CD pipelines

### Tempo para implementar:
- ⏱️ **15-30 minutos** (primeira vez)
- ⏱️ **5 minutos** (lambdas adicionais)

### Resultado:
- 🎯 **Observabilidade completa**
- 🚀 **Sem alterar código**
- 💰 **ROI rápido**

---

**Última atualização:** Dezembro 2024
