"""
Lambda Function Handler - Python 3.12
Datadog APM Lab - Sem bibliotecas Datadog (será adicionado via Layer)
"""

import json
import logging
import time
import os
from datetime import datetime
from urllib import request
from urllib.error import URLError, HTTPError

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def process_order(order_data):
    """
    Simula processamento de um pedido
    Gera logs e pode gerar traces quando Datadog estiver configurado
    """
    logger.info(f"Processing order: {order_data.get('order_id', 'unknown')}")

    # Simula validação
    if not order_data.get('customer_id'):
        logger.error("Missing customer_id in order")
        raise ValueError("customer_id is required")

    # Simula cálculo de valores
    items = order_data.get('items', [])
    total = sum(item.get('price', 0) * item.get('quantity', 0) for item in items)

    logger.info(f"Order total calculated: ${total}")

    # Simula delay de processamento
    processing_time = order_data.get('simulate_delay', 0)
    if processing_time > 0:
        logger.info(f"Simulating processing delay: {processing_time}s")
        time.sleep(processing_time)

    return {
        'order_id': order_data.get('order_id'),
        'customer_id': order_data.get('customer_id'),
        'total': total,
        'items_count': len(items),
        'processed_at': datetime.utcnow().isoformat()
    }


def fetch_external_data(url):
    """
    Faz chamada HTTP externa para gerar traces de rede
    """
    logger.info(f"Fetching data from: {url}")

    try:
        req = request.Request(url)
        req.add_header('User-Agent', 'AWS-Lambda-Datadog-Lab/1.0')

        with request.urlopen(req, timeout=10) as response:
            data = response.read()
            logger.info(f"Successfully fetched data. Status: {response.status}")
            return {
                'status': response.status,
                'data': data.decode('utf-8')[:200]  # Primeiros 200 chars
            }
    except HTTPError as e:
        logger.error(f"HTTP Error: {e.code} - {e.reason}")
        return {
            'status': e.code,
            'error': str(e.reason)
        }
    except URLError as e:
        logger.error(f"URL Error: {e.reason}")
        return {
            'status': 0,
            'error': str(e.reason)
        }
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {
            'status': 0,
            'error': str(e)
        }


def calculate_fibonacci(n):
    """
    Calcula Fibonacci para simular operação CPU-intensive
    Útil para ver traces de performance
    """
    logger.info(f"Calculating Fibonacci for n={n}")

    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        a, b = 0, 1
        for _ in range(2, n + 1):
            a, b = b, a + b
        return b


def simulate_error(error_type):
    """
    Simula diferentes tipos de erros para testar error tracking
    """
    logger.warning(f"Simulating error type: {error_type}")

    if error_type == "validation":
        raise ValueError("Validation error: Invalid input data")
    elif error_type == "not_found":
        raise KeyError("Resource not found")
    elif error_type == "timeout":
        raise TimeoutError("Operation timed out")
    elif error_type == "generic":
        raise Exception("Generic error occurred")
    else:
        raise RuntimeError(f"Unknown error type: {error_type}")


def lambda_handler(event, context):
    """
    Main Lambda handler

    Event structure:
    {
        "action": "process_order" | "fetch_data" | "calculate" | "error",
        "data": { ... }
    }
    """
    logger.info("=" * 60)
    logger.info("Lambda function invoked")
    logger.info(f"Event: {json.dumps(event)}")
    logger.info(f"Request ID: {context.aws_request_id}")
    logger.info(f"Function Name: {context.function_name}")
    logger.info(f"Remaining time: {context.get_remaining_time_in_millis()}ms")
    logger.info("=" * 60)

    # Log environment variables (Datadog)
    dd_env = os.environ.get('DD_ENV', 'not-set')
    dd_service = os.environ.get('DD_SERVICE', 'not-set')
    dd_version = os.environ.get('DD_VERSION', 'not-set')

    logger.info(f"Datadog Config - ENV: {dd_env}, SERVICE: {dd_service}, VERSION: {dd_version}")

    start_time = time.time()

    try:
        # Parse action
        action = event.get('action', 'unknown')
        data = event.get('data', {})

        logger.info(f"Action requested: {action}")

        result = None

        # Execute based on action
        if action == "process_order":
            result = process_order(data)

        elif action == "fetch_data":
            url = data.get('url', 'https://httpbin.org/json')
            result = fetch_external_data(url)

        elif action == "calculate":
            operation = data.get('operation', 'fibonacci')

            if operation == 'fibonacci':
                n = data.get('n', 10)
                fib_result = calculate_fibonacci(n)
                result = {
                    'operation': 'fibonacci',
                    'n': n,
                    'result': fib_result
                }
            else:
                logger.warning(f"Unknown operation: {operation}")
                result = {
                    'error': f'Unknown operation: {operation}'
                }

        elif action == "error":
            error_type = data.get('type', 'generic')
            simulate_error(error_type)

        elif action == "health":
            result = {
                'status': 'healthy',
                'timestamp': datetime.utcnow().isoformat(),
                'function_name': context.function_name,
                'memory_limit': context.memory_limit_in_mb
            }

        else:
            logger.warning(f"Unknown action: {action}")
            result = {
                'error': f'Unknown action: {action}',
                'available_actions': [
                    'process_order',
                    'fetch_data',
                    'calculate',
                    'error',
                    'health'
                ]
            }

        # Calculate execution time
        execution_time = (time.time() - start_time) * 1000  # ms

        logger.info(f"Action completed successfully in {execution_time:.2f}ms")

        # Build response
        response = {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'X-Request-ID': context.aws_request_id,
                'X-Execution-Time': f'{execution_time:.2f}ms'
            },
            'body': json.dumps({
                'success': True,
                'action': action,
                'result': result,
                'execution_time_ms': round(execution_time, 2),
                'request_id': context.aws_request_id,
                'timestamp': datetime.utcnow().isoformat()
            })
        }

        logger.info("Lambda execution successful")
        return response

    except Exception as e:
        execution_time = (time.time() - start_time) * 1000

        logger.error(f"Lambda execution failed: {str(e)}", exc_info=True)

        # Build error response
        response = {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'X-Request-ID': context.aws_request_id,
                'X-Execution-Time': f'{execution_time:.2f}ms'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e),
                'error_type': type(e).__name__,
                'execution_time_ms': round(execution_time, 2),
                'request_id': context.aws_request_id,
                'timestamp': datetime.utcnow().isoformat()
            })
        }

        return response
