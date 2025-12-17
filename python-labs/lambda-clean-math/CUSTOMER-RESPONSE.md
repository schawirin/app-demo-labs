# Customer Response - Case #2392372

Hello Luciano,

Thank you for your patience. I've conducted a validation lab to investigate the trace collection issue with your Lambda function.

---

## Validation Results

I created a test Lambda (`clean-math-lambda`) with the same Python 3.12 runtime, Datadog Extension Layer, and Python Layer that you're using.

**Result:** Traces are being collected successfully ✅

This confirms that:
- Your Datadog API key is valid
- The layers are working correctly
- Your Terraform configuration is proper
- The Datadog infrastructure can receive traces from your AWS account

---

## Root Cause Analysis

The key difference between my working lab and your setup is the **application architecture**:

**My lab:** Simple Python handler
```python
def lambda_handler(event, context):
    return {"result": calculation()}
```

**Your application:** FastAPI + Mangum (ASGI adapter)
```python
app = FastAPI()
handler = Mangum(app, api_gateway_base_path=API_GATEWAY_BASE_PATH)
```

The issue appears to be related to how the Datadog handler wrapper interacts with the **Mangum ASGI adapter**. The trace context is not being properly propagated through the ASGI layer, as evidenced by this log message:

```
DD_EXTENSION | DEBUG | Not sending cold start span because trace ID is unset.
```

---

## Next Steps

To help diagnose this further, could you please:

### 1. Enable Debug Logging

Add these environment variables to your Lambda:
```bash
DD_TRACE_DEBUG=true
DD_LOG_LEVEL=debug
```

Then invoke your Lambda and send us the updated logs.

### 2. Verify ddtrace Library

Add this temporary code to your Lambda handler file:
```python
import sys
print(f"Python path: {sys.path}")

try:
    import ddtrace
    print(f"ddtrace version: {ddtrace.__version__}")
    print(f"ddtrace.config.fastapi: {ddtrace.config.fastapi}")
except Exception as e:
    print(f"ddtrace check error: {e}")
```

### 3. Test Manual Instrumentation (Optional)

As a workaround, you could try manual instrumentation with FastAPI middleware:

```python
from ddtrace import tracer
from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()

@app.middleware("http")
async def datadog_trace_middleware(request, call_next):
    with tracer.trace("fastapi.request", service="loan_core"):
        response = await call_next(request)
    return response

# Your existing code
app.include_router(routers.router)
handler_installment_payment_transfers = Mangum(app, api_gateway_base_path=API_GATEWAY_BASE_PATH)
```

---

## Engineering Escalation

Based on my findings, I'm escalating this case to our Engineering team for specialized support with **FastAPI + Mangum instrumentation on Lambda**. This is a more complex architecture that may require specific configuration not covered in our standard documentation.

The validation lab I created is available in your AWS account (us-east-1:061039767542) if the Engineering team needs to reference it.

---

Let me know if you have any questions or if you're able to run the diagnostic steps above.

Best regards,
Pedro Schawirin | Solutions Engineer | Datadog
