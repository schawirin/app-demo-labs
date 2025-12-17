#!/bin/bash

# Test script for clean-math-lambda

# Check if AWS credentials are set
if [ -z "$AWS_ACCESS_KEY_ID" ]; then
    echo "❌ AWS credentials not set"
    echo "Please export AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN"
    exit 1
fi

FUNCTION_NAME="clean-math-lambda"
REGION="us-east-1"

echo "🧪 Testing Lambda: $FUNCTION_NAME"
echo ""

# Test 1: Fibonacci
echo "=== Test 1: Fibonacci(15) ==="
aws lambda invoke \
  --function-name $FUNCTION_NAME \
  --cli-binary-format raw-in-base64-out \
  --payload '{"operation":"fibonacci","number":15}' \
  --region $REGION \
  /tmp/resp1.json > /dev/null 2>&1

cat /tmp/resp1.json | jq '.body | fromjson'
echo ""

# Test 2: Factorial
echo "=== Test 2: Factorial(7) ==="
aws lambda invoke \
  --function-name $FUNCTION_NAME \
  --cli-binary-format raw-in-base64-out \
  --payload '{"operation":"factorial","number":7}' \
  --region $REGION \
  /tmp/resp2.json > /dev/null 2>&1

cat /tmp/resp2.json | jq '.body | fromjson'
echo ""

# Test 3: Prime check
echo "=== Test 3: Is 97 prime? ==="
aws lambda invoke \
  --function-name $FUNCTION_NAME \
  --cli-binary-format raw-in-base64-out \
  --payload '{"operation":"prime","number":97}' \
  --region $REGION \
  /tmp/resp3.json > /dev/null 2>&1

cat /tmp/resp3.json | jq '.body | fromjson'
echo ""

# Test 4: Calculate PI
echo "=== Test 4: Calculate PI ==="
aws lambda invoke \
  --function-name $FUNCTION_NAME \
  --cli-binary-format raw-in-base64-out \
  --payload '{"operation":"pi","iterations":50000}' \
  --region $REGION \
  /tmp/resp4.json > /dev/null 2>&1

cat /tmp/resp4.json | jq '.body | fromjson'
echo ""

# Test 5: Statistics
echo "=== Test 5: Statistics ==="
aws lambda invoke \
  --function-name $FUNCTION_NAME \
  --cli-binary-format raw-in-base64-out \
  --payload '{"operation":"stats","numbers":[5,10,15,20,25,30,35,40]}' \
  --region $REGION \
  /tmp/resp5.json > /dev/null 2>&1

cat /tmp/resp5.json | jq '.body | fromjson'
echo ""

echo "✅ All tests completed!"
