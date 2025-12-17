# Deployment Status - FastAPI + Mangum Lambda

## ✅ Completado Até Agora

### 1. IAM Role - CRIADO ✅
```
Role Name: lambda-fastapi-mangum-role
ARN: arn:aws:iam::061039767542:role/lambda-fastapi-mangum-role
Policy: AWSLambdaBasicExecutionRole
Status: ATIVO
```

### 2. Lambda Layer v1 - CRIADO ✅ (mas com erro)
```
Layer Name: fastapi-mangum-layer
Version: 1
ARN: arn:aws:lambda:us-east-1:061039767542:layer:fastapi-mangum-layer:1
Issue: pydantic_core import error (binário incompatível)
Status: NÃO FUNCIONAL
```

### 3. Lambda Function - CRIADO ✅
```
Function Name: fastapi-mangum-test
ARN: arn:aws:lambda:us-east-1:061039767542:function:fastapi-mangum-test
Runtime: Python 3.12
Handler: handler.handler (Mangum ASGI)
Memory: 512MB
Timeout: 30s
Layer: v1 (broken)
Status: CRIADO MAS NÃO FUNCIONAL
```

### 4. Lambda Layer v2 - ZIP CRIADO ✅ (precisa publicar)
```
File: fastapi-layer.zip (4.3MB)
Location: /Users/pedro.schawirin/Documents/app-demo-labs/python-labs/lambda-fastapi-mangum/fastapi-layer.zip
Built: Docker linux/amd64 with --no-cache-dir
Status: PRONTO PARA PUBLICAR (token AWS expirou)
```

---

## ⏳ Próximos Passos

### Step 1: Export New AWS Credentials

```bash
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."

# Verify
aws sts get-caller-identity
```

### Step 2: Publish Layer v2

```bash
cd /Users/pedro.schawirin/Documents/app-demo-labs/python-labs/lambda-fastapi-mangum

aws lambda publish-layer-version \
  --layer-name fastapi-mangum-layer \
  --description "FastAPI + Mangum for Lambda Python 3.12 (fixed amd64)" \
  --zip-file fileb://fastapi-layer.zip \
  --compatible-runtimes python3.12 \
  --region us-east-1
```

**Expected output:**
```json
{
  "LayerVersionArn": "arn:aws:lambda:us-east-1:061039767542:layer:fastapi-mangum-layer:2",
  "Version": 2
}
```

### Step 3: Update Lambda with Layer v2

```bash
aws lambda update-function-configuration \
  --function-name fastapi-mangum-test \
  --layers arn:aws:lambda:us-east-1:061039767542:layer:fastapi-mangum-layer:2 \
  --region us-east-1

# Wait for update
sleep 5
```

### Step 4: Test Baseline (NO Datadog)

```bash
# Test health
aws lambda invoke \
  --function-name fastapi-mangum-test \
  --cli-binary-format raw-in-base64-out \
  --payload '{"httpMethod":"GET","path":"/health","headers":{}}' \
  --region us-east-1 \
  baseline-health.json

cat baseline-health.json | jq '.'
```

**Expected successful response:**
```json
{
  "statusCode": 200,
  "body": "{\"status\":\"healthy\",\"timestamp\":\"...\",\"service\":\"fastapi-lambda-test\"}"
}
```

**If successful, test fibonacci:**
```bash
aws lambda invoke \
  --function-name fastapi-mangum-test \
  --cli-binary-format raw-in-base64-out \
  --payload '{"httpMethod":"GET","path":"/fibonacci/15","headers":{}}' \
  --region us-east-1 \
  baseline-fib.json

cat baseline-fib.json | jq '.'
```

### Step 5: Add Datadog Layers

```bash
# Update Lambda with Datadog instrumentation
aws lambda update-function-configuration \
  --function-name fastapi-mangum-test \
  --layers \
    arn:aws:lambda:us-east-1:061039767542:layer:fastapi-mangum-layer:2 \
    arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67 \
    arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114 \
  --region us-east-1

sleep 5

# Update handler to Datadog wrapper
aws lambda update-function-configuration \
  --function-name fastapi-mangum-test \
  --handler datadog_lambda.handler.handler \
  --environment "Variables={DD_API_KEY=<YOUR_DATADOG_API_KEY>,DD_SITE=datadoghq.com,DD_ENV=lab,DD_SERVICE=fastapi-mangum-test,DD_VERSION=1.0.0,DD_TRACE_ENABLED=true,DD_LOGS_INJECTION=true,DD_LAMBDA_HANDLER=handler.handler,DD_SERVERLESS_LOGS_ENABLED=true,DD_ENHANCED_METRICS=true,DD_TRACE_DEBUG=true,DD_LOG_LEVEL=debug}" \
  --region us-east-1

sleep 5
```

### Step 6: Test with Datadog

```bash
# Invoke multiple times
for i in {1..5}; do
  echo "=== Invocation $i ==="
  aws lambda invoke \
    --function-name fastapi-mangum-test \
    --cli-binary-format raw-in-base64-out \
    --payload '{"httpMethod":"GET","path":"/fibonacci/15","headers":{}}' \
    --region us-east-1 \
    datadog-test-$i.json
  sleep 2
done

# Test trace endpoint
aws lambda invoke \
  --function-name fastapi-mangum-test \
  --cli-binary-format raw-in-base64-out \
  --payload '{"httpMethod":"GET","path":"/trace-test","headers":{}}' \
  --region us-east-1 \
  trace-info.json

cat trace-info.json | jq '.body | fromjson'
```

### Step 7: Check Datadog

**Wait 1-2 minutes, then check:**

1. **APM Traces:**
   ```
   https://app.datadoghq.com/apm/traces?query=service:fastapi-mangum-test
   ```

2. **Logs:**
   ```
   https://app.datadoghq.com/logs?query=service:fastapi-mangum-test
   ```

3. **CloudWatch Logs:**
   ```bash
   aws logs tail /aws/lambda/fastapi-mangum-test --follow
   ```

   **Look for:**
   - `DD_EXTENSION | DEBUG | Not sending cold start span because trace ID is unset` ❌ (reproduces issue)
   - `ddtrace` version info
   - FastAPI integration status

---

## 🎯 Expected Results

### Scenario A: Reproduces Customer Issue ✅ (Most Likely)

**Symptoms:**
```
✅ Logs appearing in Datadog
❌ Traces NOT appearing
⚠️  Extension log: "Not sending cold start span because trace ID is unset"
❌ No trace_id in logs
```

**Response from `/trace-test`:**
```json
{
  "ddtrace": {
    "version": "2.x.x",
    "tracer_enabled": true
  }
}
```

**Conclusion:** ✅ **Confirms FastAPI + Mangum incompatibility with Datadog**

### Scenario B: Traces Work ⚠️ (Unexpected)

**Symptoms:**
```
✅ Logs appearing
✅ Traces appearing in APM
✅ trace_id in logs
```

**Conclusion:** Customer has different configuration issue

---

## 📊 Current State

| Component | Status | Details |
|-----------|--------|---------|
| IAM Role | ✅ Created | `lambda-fastapi-mangum-role` |
| Lambda Function | ✅ Created | `fastapi-mangum-test` |
| Layer v1 | ⚠️ Broken | pydantic_core error |
| Layer v2 ZIP | ✅ Ready | `fastapi-layer.zip` (4.3MB) |
| Layer v2 Published | ✅ DONE | Version 2 published |
| Lambda Updated | ✅ DONE | Using Layer v2 now |
| Test Payload | ✅ Fixed | Created proper API Gateway format |
| Baseline Test | ⏸️ Paused | Need new AWS credentials |
| Datadog Test | ❌ Pending | Need baseline first |

---

## 🔧 If Issues Occur

### Issue: Still getting pydantic_core error

**Solution:**
```bash
# Verify layer contents
aws lambda get-layer-version \
  --layer-name fastapi-mangum-layer \
  --version-number 2 \
  --region us-east-1

# Check architecture match
aws lambda get-function-configuration \
  --function-name fastapi-mangum-test \
  --region us-east-1 \
  --query 'Architectures'
```

### Issue: Lambda timeout

**Solution:**
```bash
# Increase timeout
aws lambda update-function-configuration \
  --function-name fastapi-mangum-test \
  --timeout 60 \
  --region us-east-1
```

---

## 📝 Files Ready

```
python-labs/lambda-fastapi-mangum/
├── handler.py              # FastAPI + Mangum code ✅
├── requirements.txt        # Dependencies ✅
├── lambda-fastapi.zip     # Lambda code package ✅
├── fastapi-layer.zip      # Layer v2 (READY TO PUBLISH) ✅
├── trust-policy.json      # IAM policy ✅
├── README.md              # Full documentation ✅
├── deploy.sh              # Automated script ✅
├── STATUS.md              # Status overview ✅
└── DEPLOYMENT-STATUS.md   # This file ✅
```

---

## 🚀 Quick Resume Command

```bash
# When you have new AWS credentials, run:
cd /Users/pedro.schawirin/Documents/app-demo-labs/python-labs/lambda-fastapi-mangum

# Set credentials
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."

# Verify credentials
aws sts get-caller-identity

# Test Baseline (NO Datadog) - Using proper API Gateway payload
aws lambda invoke \
  --function-name fastapi-mangum-test \
  --cli-binary-format raw-in-base64-out \
  --payload file://test-payload.json \
  --region us-east-1 \
  baseline-health-fixed.json

# Check response
cat baseline-health-fixed.json | jq '.'
```

---

**Status:** ⏸️ Paused - AWS credentials expired
**Next Action:** Test baseline with fixed API Gateway payload format (test-payload.json)
**Progress:**
- ✅ IAM Role created
- ✅ Layer v2 published and applied to Lambda
- ✅ API Gateway payload format fixed
- ⏸️ Ready to test baseline (waiting for credentials)
**Estimated Time to Complete:** 5-10 minutes
