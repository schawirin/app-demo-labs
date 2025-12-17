# Status - FastAPI + Mangum Lambda Reproduction

## ✅ Completado

1. **Lambda Code:** FastAPI + Mangum handler criado
   - Arquivo: `handler.py`
   - Framework: FastAPI com Mangum ASGI adapter
   - Endpoints: `/health`, `/fibonacci/{n}`, `/calculate`, `/trace-test`
   - Arquitetura: Idêntica ao cliente Neon

2. **IAM Role:** Criado com sucesso
   - Role: `lambda-fastapi-mangum-role`
   - ARN: `arn:aws:iam::061039767542:role/lambda-fastapi-mangum-role`
   - Policy: AWSLambdaBasicExecutionRole

3. **Deployment Package:** Lambda zip criado
   - Arquivo: `lambda-fastapi.zip` (1.6KB)
   - Contém: `handler.py` + `requirements.txt`

4. **Documentação:**
   - README.md: Instruções completas
   - deploy.sh: Script automatizado
   - STATUS.md: Este arquivo

---

## ⏳ Pendente

### 1. Criar Lambda Layer com FastAPI + Mangum

**Opção A: Via Docker (requer Docker daemon rodando)**

```bash
cd /Users/pedro.schawirin/Documents/app-demo-labs/python-labs/lambda-fastapi-mangum

# Build layer
mkdir -p layer/python
docker run --rm \
  -v $(pwd):/work \
  -w /work \
  public.ecr.aws/lambda/python:3.12 \
  pip install -r requirements.txt -t layer/python/

# Create and publish layer
cd layer && zip -r ../fastapi-layer.zip . && cd ..

aws lambda publish-layer-version \
  --layer-name fastapi-mangum-layer \
  --description "FastAPI + Mangum for Lambda Python 3.12" \
  --zip-file fileb://fastapi-layer.zip \
  --compatible-runtimes python3.12 \
  --region us-east-1
```

**Opção B: Via AWS Console**

1. Ir para: https://console.aws.amazon.com/lambda/home?region=us-east-1#/layers
2. Criar novo layer: `fastapi-mangum-layer`
3. Upload zip com dependências instaladas
4. Compatible runtime: Python 3.12

**Opção C: Usar Layer Público (se existir)**

Pesquisar no Serverless Application Repository ou AWS public layers.

### 2. Deploy Lambda

Uma vez que o layer estiver pronto:

```bash
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."

# Get layer ARN
LAYER_ARN=$(aws lambda list-layer-versions \
  --layer-name fastapi-mangum-layer \
  --query 'LayerVersions[0].LayerVersionArn' \
  --output text)

# Create Lambda
aws lambda create-function \
  --function-name fastapi-mangum-test \
  --runtime python3.12 \
  --role arn:aws:iam::061039767542:role/lambda-fastapi-mangum-role \
  --handler handler.handler \
  --zip-file fileb://lambda-fastapi.zip \
  --timeout 30 \
  --memory-size 512 \
  --layers $LAYER_ARN \
  --description "FastAPI + Mangum - Customer architecture reproduction" \
  --region us-east-1
```

### 3. Test Baseline (sem Datadog)

```bash
aws lambda invoke \
  --function-name fastapi-mangum-test \
  --cli-binary-format raw-in-base64-out \
  --payload '{"httpMethod":"GET","path":"/health","headers":{}}' \
  --region us-east-1 \
  baseline.json

cat baseline.json | jq '.'
```

### 4. Add Datadog

```bash
# Update with Datadog layers
aws lambda update-function-configuration \
  --function-name fastapi-mangum-test \
  --layers \
    $LAYER_ARN \
    arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67 \
    arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114 \
  --handler datadog_lambda.handler.handler \
  --environment "Variables={DD_API_KEY=<YOUR_DATADOG_API_KEY>,DD_SITE=datadoghq.com,DD_ENV=lab,DD_SERVICE=fastapi-mangum-test,DD_VERSION=1.0.0,DD_TRACE_ENABLED=true,DD_LOGS_INJECTION=true,DD_LAMBDA_HANDLER=handler.handler,DD_SERVERLESS_LOGS_ENABLED=true,DD_ENHANCED_METRICS=true,DD_TRACE_DEBUG=true}" \
  --region us-east-1
```

### 5. Test with Datadog

```bash
# Multiple invocations
for i in {1..5}; do
  aws lambda invoke \
    --function-name fastapi-mangum-test \
    --cli-binary-format raw-in-base64-out \
    --payload '{"httpMethod":"GET","path":"/fibonacci/15","headers":{}}' \
    --region us-east-1 \
    test$i.json
  sleep 2
done

# Check ddtrace status
aws lambda invoke \
  --function-name fastapi-mangum-test \
  --cli-binary-format raw-in-base64-out \
  --payload '{"httpMethod":"GET","path":"/trace-test","headers":{}}' \
  --region us-east-1 \
  trace-status.json

cat trace-status.json | jq '.body | fromjson'
```

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

**Conclusion:** Confirms FastAPI + Mangum incompatibility with Datadog Lambda Layer

### Scenario B: Traces Work ⚠️ (Unexpected)

**Symptoms:**
```
✅ Logs appearing
✅ Traces appearing
✅ trace_id in logs
```

**Conclusion:** Customer has different configuration issue, not architecture-related

---

## 📊 Comparison Table

| Lambda | Handler | Framework | Traces | Status |
|--------|---------|-----------|--------|--------|
| `clean-math-lambda` | `handler.lambda_handler` | None (pure Python) | ✅ Working | Deployed |
| `fastapi-mangum-test` | `handler.handler` (Mangum) | FastAPI + ASGI | ❓ Pending | Layer needed |

---

## 🔍 Analysis After Deployment

### If Traces DON'T Appear (Expected):

1. **Check Extension logs:**
   ```bash
   aws logs tail /aws/lambda/fastapi-mangum-test --follow --filter-pattern "DD_EXTENSION"
   ```

2. **Verify ddtrace status:**
   - Call `/trace-test` endpoint
   - Check if ddtrace is loaded and version
   - Verify tracer.enabled status

3. **Enable max debugging:**
   ```bash
   DD_TRACE_DEBUG=true
   DD_LOG_LEVEL=debug
   DD_TRACE_STARTUP_LOGS=true
   ```

4. **Test manual instrumentation:**
   - Modify handler.py to add `patch(fastapi=True)`
   - Redeploy and test

### If Traces DO Appear (Unexpected):

1. **Compare exact config with customer**
2. **Check customer's layer versions**
3. **Verify customer's middleware**
4. **Check for conflicting dependencies**

---

## 📝 Next Steps

1. **Start Docker daemon:** `open -a Docker`
2. **Run deploy script:** `./deploy.sh`
3. **Monitor results** in Datadog APM
4. **Document findings** for Engineering escalation

---

## 📞 Support Case Info

**Case:** #2392372
**Customer:** Neon (Luciano)
**Issue:** Traces not appearing with FastAPI + Mangum
**Lab Purpose:** Reproduce issue to validate hypotheses

---

**Created:** 2025-12-17
**Status:** Awaiting Docker to create Lambda Layer
**Ready for:** Deployment and testing
