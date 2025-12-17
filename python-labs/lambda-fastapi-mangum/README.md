# Lambda FastAPI + Mangum - Customer Architecture Reproduction

Lambda criada para **reproduzir exatamente a arquitetura do cliente Neon** e validar hipóteses sobre traces do Datadog.

---

## 🎯 Objetivo

Reproduzir o setup do cliente que **NÃO** está gerando traces:
- ✅ FastAPI framework
- ✅ Mangum ASGI adapter
- ✅ Multiple handlers
- ✅ Custom middleware
- ✅ Exception handlers
- ✅ Python 3.12

---

## 📋 Hipóteses a Validar

### Hypothesis 1: Handler Wrapper Não Intercepta Mangum
**Teste:** Deploy Lambda com FastAPI + Mangum + Datadog layers
**Esperado:** Traces não aparecem (reproduz problema do cliente)

### Hypothesis 2: Trace Context Não Propaga via ASGI
**Teste:** Verificar logs do Extension mostrando "trace ID unset"
**Esperado:** Mesmo erro do cliente

### Hypothesis 3: FastAPI Auto-instrumentation Não É Triggered
**Teste:** Endpoint `/trace-test` que verifica se ddtrace está ativo
**Esperado:** ddtrace presente mas não tracing FastAPI requests

### Hypothesis 4: Layer Não Inclui FastAPI Integration
**Teste:** Verificar se `ddtrace.contrib.fastapi` está disponível
**Esperado:** Módulo ausente ou não ativado

---

## 🚀 Deploy Instructions

### 1. Export AWS Credentials

```bash
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."
```

### 2. Create IAM Role

```bash
cd python-labs/lambda-fastapi-mangum

aws iam create-role \
  --role-name lambda-fastapi-mangum-role \
  --assume-role-policy-document file://trust-policy.json

aws iam attach-role-policy \
  --role-name lambda-fastapi-mangum-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Wait for IAM propagation
sleep 10
```

### 3. Create Lambda Layer for FastAPI + Mangum

```bash
# Build dependencies in Docker
mkdir -p layer/python
docker run --rm \
  -v $(pwd):/work \
  -w /work \
  public.ecr.aws/lambda/python:3.12 \
  pip install -r requirements.txt -t layer/python/

# Create layer zip
cd layer && zip -r ../fastapi-layer.zip . && cd ..

# Upload layer
aws lambda publish-layer-version \
  --layer-name fastapi-mangum-layer \
  --description "FastAPI + Mangum for Lambda" \
  --zip-file fileb://fastapi-layer.zip \
  --compatible-runtimes python3.12 \
  --region us-east-1
```

Save the Layer ARN from the output!

### 4. Deploy Lambda (WITHOUT Datadog first)

```bash
aws lambda create-function \
  --function-name fastapi-mangum-test \
  --runtime python3.12 \
  --role arn:aws:iam::061039767542:role/lambda-fastapi-mangum-role \
  --handler handler.handler \
  --zip-file fileb://lambda-fastapi.zip \
  --timeout 30 \
  --memory-size 512 \
  --layers <FASTAPI_LAYER_ARN_FROM_STEP_3> \
  --description "FastAPI + Mangum test - NO Datadog (baseline)" \
  --region us-east-1
```

### 5. Test Baseline (NO Datadog)

```bash
# Test health endpoint
aws lambda invoke \
  --function-name fastapi-mangum-test \
  --cli-binary-format raw-in-base64-out \
  --payload '{"httpMethod":"GET","path":"/health","headers":{}}' \
  --region us-east-1 \
  response.json

cat response.json | jq '.'

# Test fibonacci endpoint
aws lambda invoke \
  --function-name fastapi-mangum-test \
  --cli-binary-format raw-in-base64-out \
  --payload '{"httpMethod":"GET","path":"/fibonacci/15","headers":{}}' \
  --region us-east-1 \
  response.json

cat response.json | jq '.'
```

Expected: Lambda works, no traces (baseline).

### 6. Add Datadog Instrumentation

```bash
# Update Lambda with Datadog layers
aws lambda update-function-configuration \
  --function-name fastapi-mangum-test \
  --layers \
    <FASTAPI_LAYER_ARN> \
    arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67 \
    arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114 \
  --region us-east-1

# Wait for update
sleep 5

# Add Datadog handler wrapper
aws lambda update-function-configuration \
  --function-name fastapi-mangum-test \
  --handler datadog_lambda.handler.handler \
  --environment "Variables={
    DD_API_KEY=<YOUR_DATADOG_API_KEY>,
    DD_SITE=datadoghq.com,
    DD_ENV=lab,
    DD_SERVICE=fastapi-mangum-test,
    DD_VERSION=1.0.0,
    DD_TRACE_ENABLED=true,
    DD_LOGS_INJECTION=true,
    DD_LAMBDA_HANDLER=handler.handler,
    DD_SERVERLESS_LOGS_ENABLED=true,
    DD_ENHANCED_METRICS=true,
    DD_TRACE_DEBUG=true,
    DD_LOG_LEVEL=debug
  }" \
  --region us-east-1
```

### 7. Test With Datadog

```bash
# Invoke multiple times
for i in {1..5}; do
  echo "=== Invocation $i ==="
  aws lambda invoke \
    --function-name fastapi-mangum-test \
    --cli-binary-format raw-in-base64-out \
    --payload '{"httpMethod":"GET","path":"/fibonacci/15","headers":{}}' \
    --region us-east-1 \
    resp$i.json
  sleep 2
done

# Check trace-test endpoint
aws lambda invoke \
  --function-name fastapi-mangum-test \
  --cli-binary-format raw-in-base64-out \
  --payload '{"httpMethod":"GET","path":"/trace-test","headers":{}}' \
  --region us-east-1 \
  trace-test.json

cat trace-test.json | jq '.'
```

### 8. Analyze Results

**Check CloudWatch Logs:**
```bash
aws logs tail /aws/lambda/fastapi-mangum-test --follow
```

**Look for:**
- `DD_EXTENSION | DEBUG | Not sending cold start span because trace ID is unset` ❌
- `ddtrace` version and status
- FastAPI integration status

**Check Datadog APM:**
```
https://app.datadoghq.com/apm/traces?query=service:fastapi-mangum-test
```

---

## 📊 Expected Results

### Scenario A: Reproduces Customer Issue (Most Likely)

**Logs:** ✅ Appearing in Datadog
**Traces:** ❌ NOT appearing
**Extension:** Shows "trace ID unset"
**Conclusion:** Confirms FastAPI + Mangum incompatibility

### Scenario B: Traces Work (Unexpected)

**Logs:** ✅ Appearing
**Traces:** ✅ Appearing
**Conclusion:** Customer has additional configuration issue

---

## 🔍 Debugging Steps

### If Traces Don't Appear (Expected):

1. **Check ddtrace is loaded:**
   ```bash
   # Response from /trace-test should show:
   {
     "ddtrace": {
       "version": "2.x.x",
       "tracer_enabled": true
     }
   }
   ```

2. **Check FastAPI integration:**
   ```python
   # Add to handler.py temporarily:
   import ddtrace
   print(f"FastAPI integration: {ddtrace.config.fastapi}")
   ```

3. **Enable max debug:**
   ```bash
   DD_TRACE_DEBUG=true
   DD_LOG_LEVEL=debug
   DD_TRACE_STARTUP_LOGS=true
   ```

4. **Try manual instrumentation:**
   ```python
   from ddtrace import tracer, patch
   patch(fastapi=True)  # Manual patch
   ```

---

## 📁 Files

```
lambda-fastapi-mangum/
├── handler.py              # FastAPI + Mangum code
├── requirements.txt        # Dependencies
├── lambda-fastapi.zip      # Deployment package (code only)
├── trust-policy.json       # IAM role trust policy
└── README.md              # This file
```

---

## 🎯 Comparison

| Feature | clean-math-lambda | fastapi-mangum-test |
|---------|-------------------|---------------------|
| Handler | `handler.lambda_handler` | `handler.handler` (Mangum) |
| Framework | None (pure Python) | FastAPI + Mangum |
| Traces | ✅ Working | ❓ To be tested |
| Architecture | Simple | ASGI (complex) |

---

## 💡 Next Steps After Testing

### If Traces DON'T Work:
1. Confirm FastAPI + Mangum incompatibility
2. Test manual ddtrace instrumentation
3. Escalate to Datadog Engineering with findings
4. Propose FastAPI-specific documentation

### If Traces DO Work:
1. Compare exact configuration with customer
2. Check for customer-specific middleware interference
3. Verify customer's Datadog Python Layer version
4. Check for conflicting dependencies in customer's layer

---

**Created for:** Case #2392372 (Neon - Luciano)
**Purpose:** Validate trace collection issues with FastAPI + Mangum
**Status:** Ready for deployment and testing
