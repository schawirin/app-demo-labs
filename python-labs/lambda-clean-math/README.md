# Clean Math Lambda - ZERO Datadog Code

Lambda **100% limpa** para demonstrar instrumentação Datadog **sem modificar código**.

## ✅ O que TEM nesse código

- ✅ Pure Python 3.12
- ✅ Cálculos matemáticos (fibonacci, factorial, prime, pi, stats)
- ✅ Logging básico com `print`
- ✅ ZERO bibliotecas externas
- ✅ ZERO imports do Datadog

## ❌ O que NÃO TEM nesse código

- ❌ `import datadog`
- ❌ `from ddtrace import tracer`
- ❌ `os.environ.get('DD_*')`
- ❌ Qualquer menção ao Datadog

---

## 📍 Lambda Deployada

**Nome:** `clean-math-lambda`
**ARN:** `arn:aws:lambda:us-east-1:061039767542:function:clean-math-lambda`
**Runtime:** Python 3.12
**Handler:** `handler.lambda_handler`
**Região:** us-east-1

---

## 🧪 Testes Executados

### 1. Fibonacci(10) = 55
```json
{"operation": "fibonacci", "number": 10}
```

### 2. Calculate PI (10k iterations) = 3.1415
```json
{"operation": "pi", "iterations": 10000}
```

### 3. Statistics [10,20,30,40,50]
```json
{"operation": "stats", "numbers": [10,20,30,40,50]}
```

---

## 🎯 Operações Disponíveis

| Operação | Payload | Descrição |
|----------|---------|-----------|
| `fibonacci` | `{"operation":"fibonacci","number":10}` | Calcula Fibonacci |
| `factorial` | `{"operation":"factorial","number":5}` | Calcula Fatorial |
| `prime` | `{"operation":"prime","number":17}` | Verifica se é primo |
| `pi` | `{"operation":"pi","iterations":10000}` | Aproxima PI |
| `stats` | `{"operation":"stats","numbers":[1,2,3]}` | Estatísticas |

---

## 🚀 Como Testar

```bash
# Export AWS credentials first
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."

# Test Fibonacci
aws lambda invoke \
  --function-name clean-math-lambda \
  --cli-binary-format raw-in-base64-out \
  --payload '{"operation":"fibonacci","number":15}' \
  --region us-east-1 \
  response.json

cat response.json | jq '.body | fromjson'
```

---

## 📊 Estado Atual: SEM Datadog

**Logs:** Vão para CloudWatch (basic)
**Traces:** Nenhum
**Metrics:** Apenas métricas default do Lambda

---

## 🎯 Próximo Passo: Instrumentar com Datadog

Agora você pode adicionar **Datadog APM** sem tocar no código:

1. **Adicionar Datadog Layers:**
   - Datadog Extension Layer
   - Datadog Python Layer

2. **Configurar Handler Wrapper:**
   - Mudar handler de `handler.lambda_handler` para `datadog_lambda.handler.handler`
   - Adicionar `DD_LAMBDA_HANDLER=handler.lambda_handler`

3. **Environment Variables:**
   - `DD_API_KEY`
   - `DD_SITE`
   - `DD_TRACE_ENABLED=true`
   - `DD_LOGS_INJECTION=true`

**RESULTADO:** Traces, Logs correlacionados, e Metrics **sem mudar 1 linha de código Python!**

---

## 📁 Arquivos

```
lambda-clean-math/
├── handler.py              # Lambda function (CLEAN)
├── lambda.zip             # Deployment package
├── payload-fib.json       # Fibonacci test
├── payload-pi.json        # PI calculation test
├── payload-stats.json     # Statistics test
├── test-payloads.json     # All test payloads
└── README.md             # This file
```

---

## 🔑 Key Points

1. **Código está 100% limpo** - Zero imports do Datadog
2. **Lambda já deployada na AWS** - Pronta para uso
3. **Testada e funcionando** - 3 testes bem-sucedidos
4. **Pronta para instrumentação** - Adicione layers sem code changes

---

**Criado para demonstrar:** Zero-code instrumentation com Datadog APM
