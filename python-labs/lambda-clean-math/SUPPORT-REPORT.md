# Internal Support Report - Case #2392372
**Customer:** Neon (luciano.castilhos@neon.com.br)
**Issue:** Lambda traces not appearing despite proper Datadog configuration
**Date:** December 16, 2025
**SE:** Pedro Schawirin

---

## 📋 Executive Summary

Customer successfully configured Datadog Lambda Extension and Python Layer via Terraform, logs are flowing to Datadog, but **traces are not being generated**.

I created a validation lab with a simple Lambda handler that **successfully generates traces**, confirming Datadog infrastructure is working. However, customer's architecture uses **FastAPI + Mangum** (ASGI adapter), which may require additional configuration not covered in standard documentation.

---

## 🧪 Validation Lab Results

### Lab Setup
Created a clean test Lambda to validate Datadog instrumentation:

**Lambda:** `clean-math-lambda`
**Runtime:** Python 3.12
**Handler:** `handler.lambda_handler` (simple Python function)
**Layers:**
- `arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67`
- `arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114`

**Key Environment Variables:**
```bash
DD_API_KEY                 = "***"
DD_TRACE_ENABLED           = "true"
DD_LOGS_INJECTION          = "true"
DD_LAMBDA_HANDLER          = "handler.lambda_handler"
DD_SERVERLESS_LOGS_ENABLED = "true"
DD_ENHANCED_METRICS        = "true"
```

**Instrumentation Method:**
- Handler wrapper: `datadog_lambda.handler.handler`
- Original handler referenced via `DD_LAMBDA_HANDLER`

### Lab Results: ✅ SUCCESS

**Traces:** ✅ Appearing in APM
**Logs:** ✅ Appearing with trace correlation
**Metrics:** ✅ Enhanced metrics visible

**Conclusion:** Datadog instrumentation works correctly with **standard Python Lambda handlers**.

---

## 🏢 Customer Architecture

### Customer Setup
**Service:** `loan_core` (FastAPI application)
**Runtime:** Python 3.12
**Framework:** FastAPI + Mangum
**Lambda Handler:** `loan_core.modules.econsignado.installments.lambda.handler_installment_payment_transfers`

### Customer Code Structure

```python
from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()
app.include_router(routers.router)
app.add_middleware(CorrelationLogRequestMiddleware)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, exception_handler)
app.add_exception_handler(DomainError, domain_exception_handler)

# Multiple handlers using Mangum ASGI adapter
handler_installment_bookkeeping_events = Mangum(app, api_gateway_base_path=API_GATEWAY_BASE_PATH)
handler_installment_payment_transfers = Mangum(app, api_gateway_base_path=API_GATEWAY_BASE_PATH)
# ... more handlers
```

### Customer Terraform Configuration

```hcl
module "lambda" {
  # ...
  lambda_handler = "loan_core.modules.econsignado.installments.lambda.handler_installment_payment_transfers"

  env_vars = {
    DD_API_KEY_SECRET_ARN = data.aws_secretsmanager_secret.datadog_api_key.arn
    DD_SITE               = "datadoghq.com"
    DD_ENV                = terraform.workspace
    DD_SERVICE            = local.service
    DD_VERSION            = "1.0.0"
  }

  layers = [
    module.lambda_layer.arn,
    var.datadog_extension_layer_arn,
    var.datadog_python_layer_arn
  ]
}
```

**Note:** Customer is using Terraform module from official Datadog documentation.

---

## 🔍 Observed Behavior

### What's Working ✅
1. **Logs:** Flowing to Datadog successfully
2. **Extension:** Running without errors
3. **Layers:** Properly attached
4. **Configuration:** Terraform setup follows official guide

### What's NOT Working ❌
1. **Traces:** Not appearing in APM
2. **Trace Correlation:** Logs don't have `trace_id`

### Key Log Message
```
DD_EXTENSION | DEBUG | Not sending cold start span because trace ID is unset.
```

This indicates the **trace context is not being created/propagated**.

---

## 🤔 Root Cause Analysis

### Hypothesis: ASGI Adapter Incompatibility

The key difference between the working lab and customer setup:

**Lab (Working):**
```python
# Simple, direct handler
def lambda_handler(event, context):
    result = fibonacci(15)
    return {"result": result}
```

**Customer (Not Working):**
```python
# FastAPI + Mangum ASGI adapter
app = FastAPI()
handler = Mangum(app, api_gateway_base_path=API_GATEWAY_BASE_PATH)
```

### Potential Issues

1. **Mangum ASGI Wrapper:**
   - Mangum wraps FastAPI to make it Lambda-compatible
   - Datadog handler wrapper may not properly intercept Mangum's execution flow
   - Trace context might not propagate through ASGI layers

2. **Handler Wrapping Order:**
   ```
   AWS Lambda → datadog_lambda.handler.handler → Mangum → FastAPI
   ```
   The Datadog wrapper may not detect the actual request processing happening inside Mangum.

3. **Missing FastAPI Integration:**
   - Standard ddtrace library has specific FastAPI integration
   - Lambda Layer may not include FastAPI auto-instrumentation
   - FastAPI middleware for tracing may need explicit setup

---

## 🧪 Tests Performed

### Test 1: Verify DD_TRACE_ENABLED
- ✅ Set `DD_TRACE_ENABLED=true`
- ❌ No traces generated

### Test 2: Check Handler Configuration
- ✅ TF module automatically configures handler wrapper
- ✅ No handler configuration errors in logs

### Test 3: Review Serverless Flare
- ✅ Flare received (case #2392372)
- ✅ No errors in extension logs
- ⚠️ Trace ID unset during cold start

---

## 🔧 Recommended Next Steps

### Immediate Actions

1. **Verify ddtrace Installation in Layer:**
   ```python
   # Add temporary logging to customer's Lambda
   import sys
   print(f"Python path: {sys.path}")

   try:
       import ddtrace
       print(f"ddtrace version: {ddtrace.__version__}")
   except ImportError:
       print("ddtrace not found!")
   ```

2. **Enable ddtrace Debug Logging:**
   ```bash
   DD_TRACE_DEBUG=true
   DD_LOG_LEVEL=debug
   ```

3. **Test Manual Instrumentation:**
   ```python
   from ddtrace import tracer
   from mangum import Mangum

   app = FastAPI()

   @app.middleware("http")
   async def add_datadog_trace(request, call_next):
       with tracer.trace("fastapi.request"):
           response = await call_next(request)
       return response

   handler = Mangum(app)
   ```

### Investigation Questions

1. **Does ddtrace support Mangum ASGI adapter?**
   - Check ddtrace compatibility matrix
   - Review similar cases with ASGI frameworks

2. **Is FastAPI auto-instrumentation included in Lambda Layer?**
   - Verify layer contents
   - Check if additional setup is needed

3. **Does handler wrapper properly intercept ASGI calls?**
   - Review datadog_lambda wrapper source
   - Check if ASGI context propagation is supported

### Escalation Path

**Recommend escalating to Datadog Engineering:**
- Complex architecture (FastAPI + Mangum + Lambda)
- Non-standard handler pattern
- May require Lambda Layer enhancement
- Similar case: [Ticket #2365124](https://datadog.zendesk.com/agent/tickets/2365124)

---

## 📚 Documentation Gaps

Current documentation does not cover:
1. ❌ FastAPI + Mangum integration with Lambda Layer
2. ❌ ASGI framework instrumentation in Lambda
3. ❌ Troubleshooting trace propagation with API Gateway adapters

**Suggested Documentation:**
- "Instrumenting FastAPI on AWS Lambda"
- "ASGI Frameworks with Datadog Lambda Layer"
- "Troubleshooting Missing Traces in Complex Lambda Architectures"

---

## 📎 Attachments

1. **Lab Lambda:** `clean-math-lambda` (us-east-1:061039767542)
2. **Lab Code:** `/python-labs/lambda-clean-math/`
3. **Customer Flare:** Attached to ticket #2392372
4. **Customer Terraform:** Shared in ticket

---

## 💡 Conclusion

**Lab Validation:** ✅ Datadog instrumentation works perfectly with standard Lambda handlers.

**Customer Issue:** ❌ Traces not generated with FastAPI + Mangum architecture.

**Root Cause:** Likely incompatibility or missing configuration for ASGI frameworks with Datadog Lambda Layer.

**Recommendation:** Escalate to Engineering for FastAPI + Mangum specific guidance or Layer enhancement.

---

**Prepared by:** Pedro Schawirin (SE - Datadog)
**Case:** #2392372
**Customer:** Neon
**Date:** December 16, 2025
