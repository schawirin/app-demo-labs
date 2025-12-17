# Antes vs Depois - Datadog Instrumentation

## 📋 Configuração da Lambda

### ANTES (Clean Lambda)

```hcl
Handler: handler.lambda_handler
Runtime: python3.12
Layers:  []

Environment Variables:
  (nenhuma)

Code:
  ✅ 100% Python puro
  ✅ Zero imports do Datadog
  ✅ Apenas cálculos matemáticos
```

---

### DEPOIS (Com Datadog)

```hcl
Handler: datadog_lambda.handler.handler
Runtime: python3.12
Layers:
  - arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67
  - arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114

Environment Variables:
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

Code:
  ✅ 100% Python puro (SEM MUDANÇAS)
  ✅ Zero imports do Datadog (SEM MUDANÇAS)
  ✅ Apenas cálculos matemáticos (SEM MUDANÇAS)
```

---

## 🔄 Como Funciona

### ANTES: Fluxo Normal

```
AWS Lambda invoca
       ↓
handler.lambda_handler (seu código)
       ↓
Executa cálculo
       ↓
Retorna resultado
       ↓
CloudWatch Logs (básico)
```

---

### DEPOIS: Fluxo com Datadog

```
AWS Lambda invoca
       ↓
datadog_lambda.handler.handler (wrapper Datadog)
       ↓
[Datadog inicia trace] 🟢
       ↓
handler.lambda_handler (seu código - SEM MUDANÇAS)
       ↓
Executa cálculo
       ↓
Retorna resultado
       ↓
[Datadog finaliza trace] 🟢
       ↓
CloudWatch Logs + Datadog
```

**O código Python continua 100% igual!**

---

## 📊 Observabilidade

### ANTES

| Feature | Status | Onde ver |
|---------|--------|----------|
| Logs | ✅ Básico | CloudWatch |
| Traces | ❌ Nenhum | - |
| Métricas | ✅ Básicas | CloudWatch Metrics |
| APM | ❌ Não | - |
| Correlação Logs+Traces | ❌ Não | - |

---

### DEPOIS

| Feature | Status | Onde ver |
|---------|--------|----------|
| Logs | ✅ Enhanced | CloudWatch + Datadog |
| Traces | ✅ Distributed | Datadog APM |
| Métricas | ✅ Enhanced + Custom | Datadog |
| APM | ✅ Completo | Datadog APM |
| Correlação Logs+Traces | ✅ Automática | Datadog |

---

## 🎯 O que você ganha

### 1. APM Traces

```
Ver no Datadog:
- Tempo de execução de cada função
- Chamadas recursivas do fibonacci()
- Latência total da Lambda
- Distributed tracing (se chamar outros serviços)
```

### 2. Logs Correlacionados

```
Cada log tem:
- trace_id
- span_id
- service
- env
- version

→ Clique no log e vá direto para o trace!
```

### 3. Métricas Enhanced

```
- aws.lambda.enhanced.invocations
- aws.lambda.enhanced.errors
- aws.lambda.enhanced.duration
- aws.lambda.enhanced.billed_duration
- aws.lambda.enhanced.estimated_cost
- Custom metrics automáticos
```

### 4. Serverless View

```
Dashboard completo no Datadog com:
- Cold starts
- Erros
- Throttles
- Timeouts
- Custo estimado
```

---

## 💰 Custo

**Código adicional:** 0 bytes (nada muda no código)

**Layers:** ~50MB (Datadog Extension + Python Layer)

**Execução:**
- Extension roda em paralelo (não adiciona latência)
- Overhead: ~1-2ms por invocação

**AWS Lambda:**
- Cobrança por duração permanece similar
- Pequeno aumento por causa do layer size

---

## 🔑 Key Takeaway

**0 linhas de código modificadas**

```python
# Este código NUNCA muda:
def lambda_handler(event, context):
    result = fibonacci(15)
    return {"result": result}
```

**Toda instrumentação vem de:**
1. ✅ Layer do Datadog
2. ✅ Handler wrapper
3. ✅ Environment variables

---

## 📸 Screenshot Esperado no Datadog

**APM Traces:**
```
Service: clean-math-lambda
Resource: handler.lambda_handler
Duration: 2.5ms
Spans:
  └─ aws.lambda (2.5ms)
     └─ handler.lambda_handler (2.3ms)
        └─ fibonacci() (2.1ms)
```

**Logs:**
```
[INFO] Request received at 2025-12-15T19:00:00
[INFO] Event: {"operation":"fibonacci","number":15}
[INFO] Operation completed in 0.002s

Tags:
  service:clean-math-lambda
  env:lab
  version:1.0.0
  trace_id:123456789
```

---

**Zero Code Changes = Maximum Value** 🚀
