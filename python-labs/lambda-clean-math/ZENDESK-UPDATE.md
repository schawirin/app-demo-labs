# Internal Update - Case #2392372

## Validation Lab - SUCCESS ✅

Created test Lambda to validate Datadog instrumentation:
- **Lambda:** `clean-math-lambda` (us-east-1:061039767542)
- **Runtime:** Python 3.12
- **Handler:** Simple Python function (not ASGI)
- **Result:** Traces + Logs + Metrics working perfectly

**This confirms:** Datadog infrastructure and configuration are correct.

---

## Key Difference: Architecture

**Lab (Working):**
```python
def lambda_handler(event, context):
    return {"result": fibonacci(15)}
```

**Customer (Not Working):**
```python
from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()
handler = Mangum(app, api_gateway_base_path=API_GATEWAY_BASE_PATH)
```

---

## Root Cause Hypothesis

Customer uses **FastAPI + Mangum (ASGI adapter)**:
- Mangum wraps FastAPI to make it Lambda-compatible
- Datadog handler wrapper may not properly intercept ASGI execution flow
- Trace context not propagating through: `Datadog wrapper → Mangum → FastAPI`

**Evidence:**
```
DD_EXTENSION | DEBUG | Not sending cold start span because trace ID is unset.
```

---

## Recommended Actions

### 1. Enable Debug Logging
Add to customer's Lambda:
```bash
DD_TRACE_DEBUG=true
DD_LOG_LEVEL=debug
```

### 2. Verify ddtrace in Layer
Ask customer to add temporary logging:
```python
try:
    import ddtrace
    print(f"ddtrace version: {ddtrace.__version__}")
except ImportError:
    print("ddtrace not found!")
```

### 3. Test Manual Instrumentation
```python
from ddtrace import tracer

@app.middleware("http")
async def add_datadog_trace(request, call_next):
    with tracer.trace("fastapi.request"):
        response = await call_next(request)
    return response
```

---

## Escalation Recommendation

**Suggest escalating to Engineering:**
- Non-standard architecture (FastAPI + Mangum)
- ASGI framework instrumentation not documented
- May require Lambda Layer enhancement for ASGI support
- Similar case: Ticket #2365124

---

## Documentation Gap

Current docs don't cover:
- ❌ FastAPI + Mangum with Lambda Layer
- ❌ ASGI framework instrumentation
- ❌ Troubleshooting traces with API Gateway adapters

---

**Lab available for Engineering review:** `clean-math-lambda` (account 061039767542, us-east-1)
