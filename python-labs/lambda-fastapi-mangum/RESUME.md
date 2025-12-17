# Quick Resume - FastAPI + Mangum Testing

## Current Status

✅ **DONE:**
- IAM Role: `lambda-fastapi-mangum-role` created
- Lambda Function: `fastapi-mangum-test` deployed
- Layer v2: Published and applied (fixed pydantic_core error)
- Test Payload: Fixed API Gateway format (`test-payload.json`)

⏸️ **PAUSED:**
- AWS credentials expired
- Ready to test baseline

---

## Resume Commands

### Step 1: Set AWS Credentials

```bash
cd /Users/pedro.schawirin/Documents/app-demo-labs/python-labs/lambda-fastapi-mangum

export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."

# Verify
aws sts get-caller-identity
```

### Step 2: Test Baseline (NO Datadog)

```bash
# Test health endpoint
aws lambda invoke \
  --function-name fastapi-mangum-test \
  --cli-binary-format raw-in-base64-out \
  --payload file://test-payload.json \
  --region us-east-1 \
  baseline-health-fixed.json

cat baseline-health-fixed.json | jq '.'
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "headers": {...},
  "body": "{\"status\":\"healthy\",\"timestamp\":\"2025-12-17T...\",\"service\":\"fastapi-lambda-test\"}"
}
```

**If successful, continue to Step 3. If error, debug first.**

---

### Step 3: Add Datadog Instrumentation

```bash
# Add Datadog layers
aws lambda update-function-configuration \
  --function-name fastapi-mangum-test \
  --layers \
    arn:aws:lambda:us-east-1:061039767542:layer:fastapi-mangum-layer:2 \
    arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67 \
    arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114 \
  --region us-east-1

echo "Waiting 5s for update..."
sleep 5

# Update handler and add Datadog environment variables
aws lambda update-function-configuration \
  --function-name fastapi-mangum-test \
  --handler datadog_lambda.handler.handler \
  --environment "Variables={DD_API_KEY=<YOUR_DATADOG_API_KEY>,DD_SITE=datadoghq.com,DD_ENV=lab,DD_SERVICE=fastapi-mangum-test,DD_VERSION=1.0.0,DD_TRACE_ENABLED=true,DD_LOGS_INJECTION=true,DD_LAMBDA_HANDLER=handler.handler,DD_SERVERLESS_LOGS_ENABLED=true,DD_ENHANCED_METRICS=true,DD_TRACE_DEBUG=true,DD_LOG_LEVEL=debug}" \
  --region us-east-1

echo "Waiting 5s for update..."
sleep 5
```

---

### Step 4: Test With Datadog

```bash
# Invoke multiple times
for i in {1..3}; do
  echo "=== Invocation $i ==="
  aws lambda invoke \
    --function-name fastapi-mangum-test \
    --cli-binary-format raw-in-base64-out \
    --payload file://test-payload.json \
    --region us-east-1 \
    datadog-test-$i.json
  sleep 2
done

# Check response
cat datadog-test-1.json | jq '.'

# Test trace-test endpoint
aws lambda invoke \
  --function-name fastapi-mangum-test \
  --cli-binary-format raw-in-base64-out \
  --payload file://test-payload.json \
  --region us-east-1 \
  trace-info.json

cat trace-info.json | jq '.'
```

---

### Step 5: Monitor CloudWatch Logs

```bash
# Tail logs in real-time
aws logs tail /aws/lambda/fastapi-mangum-test --follow --region us-east-1
```

**Look for:**
- ✅ `DD_EXTENSION | INFO | Extension starting` (Datadog starting)
- ✅ `ddtrace` version logs
- ❌ `Not sending cold start span because trace ID is unset` (reproduces customer issue)
- ✅ Trace IDs in logs (or absence of them)

---

### Step 6: Check Datadog UI

Wait 1-2 minutes, then check:

**APM Traces:**
```
https://app.datadoghq.com/apm/traces?query=service:fastapi-mangum-test
```

**Logs:**
```
https://app.datadoghq.com/logs?query=service:fastapi-mangum-test
```

---

## Expected Results

### Scenario A: Reproduces Customer Issue ✅ (Most Likely)

**Symptoms:**
- ✅ Logs appearing in Datadog
- ❌ Traces NOT appearing in APM
- ❌ No `trace_id` in logs
- ⚠️ Extension log: "Not sending cold start span because trace ID is unset"

**Response from `/trace-test`:**
```json
{
  "statusCode": 200,
  "body": "{\"ddtrace\":{\"version\":\"2.x.x\",\"tracer_enabled\":true}}"
}
```

**Conclusion:** ✅ Confirms FastAPI + Mangum incompatibility with Datadog tracing

### Scenario B: Traces Work ⚠️ (Unexpected)

**Symptoms:**
- ✅ Logs appearing
- ✅ Traces appearing in APM
- ✅ `trace_id` present in logs

**Conclusion:** Customer has different configuration issue, not architecture-related

---

## Files in This Directory

```
python-labs/lambda-fastapi-mangum/
├── handler.py                  # FastAPI + Mangum code ✅
├── requirements.txt            # Dependencies ✅
├── lambda-fastapi.zip         # Lambda deployment package ✅
├── fastapi-layer.zip          # Layer v2 (4.3MB) ✅
├── test-payload.json          # Fixed API Gateway format ✅
├── trust-policy.json          # IAM trust policy ✅
├── README.md                  # Full documentation ✅
├── DEPLOYMENT-STATUS.md       # Detailed status ✅
├── STATUS.md                  # Quick overview ✅
└── RESUME.md                  # This file ✅
```

---

## Troubleshooting

### Issue: Still getting Mangum handler inference error

**Check:**
```bash
# Verify payload format
cat test-payload.json | jq '.'
```

Make sure it has all API Gateway Lambda Proxy required fields:
- `httpMethod`, `path`, `headers`, `requestContext`

### Issue: Import errors

**Check Layer:**
```bash
aws lambda get-function-configuration \
  --function-name fastapi-mangum-test \
  --region us-east-1 \
  --query 'Layers'
```

Should show Layer version 2 (not 1).

---

**Support Case:** #2392372 (Neon - Luciano)
**Objective:** Reproduce FastAPI + Mangum trace collection issue
**Time to Complete:** 5-10 minutes once credentials are set
