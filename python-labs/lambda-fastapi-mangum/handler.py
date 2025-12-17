"""
Lambda with FastAPI + Mangum - Reproducing Customer Architecture
This simulates the customer's setup to validate trace collection issues
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from mangum import Mangum
import time
from datetime import datetime


# Create FastAPI app (similar to customer)
app = FastAPI(title="FastAPI Lambda Test")


# Custom middleware (similar to customer's CorrelationLogRequestMiddleware)
@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    start_time = time.time()

    print(f"[{datetime.now().isoformat()}] Request started: {request.method} {request.url.path}")

    response = await call_next(request)

    duration = time.time() - start_time
    print(f"[{datetime.now().isoformat()}] Request completed in {duration:.3f}s - Status: {response.status_code}")

    return response


# Routes (similar to customer's routers)
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "fastapi-lambda-test"
    }


@app.get("/fibonacci/{number}")
async def calculate_fibonacci(number: int):
    """Calculate fibonacci - similar to clean-math-lambda"""
    def fib(n):
        if n <= 1:
            return n
        return fib(n - 1) + fib(n - 2)

    start_time = time.time()
    result = fib(number)
    duration = time.time() - start_time

    return {
        "operation": "fibonacci",
        "input": number,
        "result": result,
        "execution_time_ms": round(duration * 1000, 2),
        "timestamp": datetime.now().isoformat()
    }


@app.post("/calculate")
async def calculate(request: Request):
    """Generic calculation endpoint"""
    body = await request.json()
    operation = body.get("operation", "fibonacci")
    number = body.get("number", 10)

    def fib(n):
        if n <= 1:
            return n
        return fib(n - 1) + fib(n - 2)

    result = fib(number)

    return {
        "operation": operation,
        "input": number,
        "result": result,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/trace-test")
async def trace_test():
    """Endpoint specifically for testing trace propagation"""
    import sys

    # Check if ddtrace is available
    ddtrace_info = "not available"
    try:
        import ddtrace
        ddtrace_info = {
            "version": ddtrace.__version__,
            "tracer_enabled": ddtrace.tracer.enabled,
        }
    except ImportError:
        ddtrace_info = "ddtrace not imported"
    except Exception as e:
        ddtrace_info = f"error: {str(e)}"

    return {
        "message": "Trace test endpoint",
        "python_version": sys.version,
        "ddtrace": ddtrace_info,
        "timestamp": datetime.now().isoformat()
    }


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Generic exception handler (similar to customer)"""
    print(f"[ERROR] Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )


# CRITICAL: Mangum handler (THIS IS WHAT THE CUSTOMER USES)
# This wraps FastAPI to make it Lambda-compatible
handler = Mangum(app, lifespan="off")


# Alternative: Named handlers (like customer has multiple)
handler_main = Mangum(app, lifespan="off")
handler_api = Mangum(app, lifespan="off")
