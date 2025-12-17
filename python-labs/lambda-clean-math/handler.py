"""
Clean Lambda Function - Pure Math Calculations
NO external dependencies, NO monitoring libraries
"""

import json
import time
from datetime import datetime


def fibonacci(n):
    """Calculate fibonacci number"""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


def factorial(n):
    """Calculate factorial"""
    if n <= 1:
        return 1
    return n * factorial(n - 1)


def is_prime(n):
    """Check if number is prime"""
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True


def calculate_pi(iterations=1000):
    """Approximate PI using Leibniz formula"""
    pi = 0
    for i in range(iterations):
        pi += ((-1) ** i) / (2 * i + 1)
    return 4 * pi


def process_numbers(numbers):
    """Process a list of numbers and return statistics"""
    if not numbers:
        return {"error": "Empty list"}

    total = sum(numbers)
    avg = total / len(numbers)
    max_num = max(numbers)
    min_num = min(numbers)

    return {
        "count": len(numbers),
        "sum": total,
        "average": avg,
        "max": max_num,
        "min": min_num
    }


def lambda_handler(event, context):
    """
    Main handler - pure math calculations

    Event examples:
    {"operation": "fibonacci", "number": 10}
    {"operation": "factorial", "number": 5}
    {"operation": "prime", "number": 17}
    {"operation": "pi", "iterations": 10000}
    {"operation": "stats", "numbers": [1, 2, 3, 4, 5]}
    """

    print(f"Request received at {datetime.now().isoformat()}")
    print(f"Event: {json.dumps(event)}")

    operation = event.get('operation', 'fibonacci')

    try:
        start_time = time.time()

        if operation == 'fibonacci':
            number = event.get('number', 10)
            result = fibonacci(number)
            response = {
                "operation": "fibonacci",
                "input": number,
                "result": result
            }

        elif operation == 'factorial':
            number = event.get('number', 5)
            result = factorial(number)
            response = {
                "operation": "factorial",
                "input": number,
                "result": result
            }

        elif operation == 'prime':
            number = event.get('number', 17)
            result = is_prime(number)
            response = {
                "operation": "prime_check",
                "input": number,
                "is_prime": result
            }

        elif operation == 'pi':
            iterations = event.get('iterations', 1000)
            result = calculate_pi(iterations)
            response = {
                "operation": "calculate_pi",
                "iterations": iterations,
                "result": result
            }

        elif operation == 'stats':
            numbers = event.get('numbers', [1, 2, 3, 4, 5])
            result = process_numbers(numbers)
            response = {
                "operation": "statistics",
                "result": result
            }

        else:
            response = {
                "error": f"Unknown operation: {operation}",
                "available_operations": ["fibonacci", "factorial", "prime", "pi", "stats"]
            }

        duration = time.time() - start_time
        response['execution_time_ms'] = round(duration * 1000, 2)
        response['timestamp'] = datetime.now().isoformat()

        print(f"Operation completed in {duration:.3f}s")

        return {
            'statusCode': 200,
            'body': json.dumps(response)
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'operation': operation
            })
        }
