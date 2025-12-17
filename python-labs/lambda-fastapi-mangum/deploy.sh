#!/bin/bash

# Deploy FastAPI + Mangum Lambda to reproduce customer issue

set -e

echo "🔬 FastAPI + Mangum Lambda - Customer Issue Reproduction"
echo "=========================================================="
echo ""

# Check AWS credentials
if [ -z "$AWS_ACCESS_KEY_ID" ]; then
    echo "❌ AWS credentials not set"
    echo ""
    echo "Please export:"
    echo "  export AWS_ACCESS_KEY_ID=\"...\""
    echo "  export AWS_SECRET_ACCESS_KEY=\"...\""
    echo "  export AWS_SESSION_TOKEN=\"...\""
    exit 1
fi

echo "✅ AWS credentials found"
aws sts get-caller-identity
echo ""

FUNCTION_NAME="fastapi-mangum-test"
ROLE_NAME="lambda-fastapi-mangum-role"
LAYER_NAME="fastapi-mangum-layer"
REGION="us-east-1"

# Step 1: Create IAM Role
echo "📝 Step 1: Creating IAM role..."
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text 2>/dev/null || true)

if [ -z "$ROLE_ARN" ]; then
    aws iam create-role \
      --role-name $ROLE_NAME \
      --assume-role-policy-document file://trust-policy.json

    aws iam attach-role-policy \
      --role-name $ROLE_NAME \
      --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

    echo "⏳ Waiting 10s for IAM propagation..."
    sleep 10

    ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
fi

echo "✅ Role ARN: $ROLE_ARN"
echo ""

# Step 2: Create Lambda Layer with Dependencies
echo "📦 Step 2: Creating FastAPI + Mangum layer..."

if [ ! -d "layer" ]; then
    mkdir -p layer/python

    echo "🐳 Building dependencies with Docker..."
    docker run --rm \
      -v $(pwd):/work \
      -w /work \
      public.ecr.aws/lambda/python:3.12 \
      pip install -r requirements.txt -t layer/python/ --quiet

    echo "📦 Creating layer zip..."
    cd layer && zip -r -q ../fastapi-layer.zip . && cd ..

    echo "☁️  Publishing layer to AWS..."
    LAYER_VERSION=$(aws lambda publish-layer-version \
      --layer-name $LAYER_NAME \
      --description "FastAPI + Mangum for Lambda Python 3.12" \
      --zip-file fileb://fastapi-layer.zip \
      --compatible-runtimes python3.12 \
      --region $REGION \
      --query 'Version' \
      --output text)

    echo "✅ Layer published: version $LAYER_VERSION"
fi

LAYER_ARN=$(aws lambda list-layer-versions \
  --layer-name $LAYER_NAME \
  --region $REGION \
  --query 'LayerVersions[0].LayerVersionArn' \
  --output text)

echo "✅ Layer ARN: $LAYER_ARN"
echo ""

# Step 3: Deploy Lambda WITHOUT Datadog (baseline)
echo "🚀 Step 3: Deploying Lambda (baseline - NO Datadog)..."

# Check if Lambda exists
LAMBDA_EXISTS=$(aws lambda get-function --function-name $FUNCTION_NAME --region $REGION 2>/dev/null && echo "yes" || echo "no")

if [ "$LAMBDA_EXISTS" == "no" ]; then
    aws lambda create-function \
      --function-name $FUNCTION_NAME \
      --runtime python3.12 \
      --role $ROLE_ARN \
      --handler handler.handler \
      --zip-file fileb://lambda-fastapi.zip \
      --timeout 30 \
      --memory-size 512 \
      --layers $LAYER_ARN \
      --description "FastAPI + Mangum - Reproducing customer architecture (NO Datadog)" \
      --region $REGION \
      --query 'FunctionArn' \
      --output text

    echo "✅ Lambda created"
else
    echo "⚠️  Lambda already exists, updating code..."
    aws lambda update-function-code \
      --function-name $FUNCTION_NAME \
      --zip-file fileb://lambda-fastapi.zip \
      --region $REGION > /dev/null

    echo "✅ Lambda updated"
fi

echo ""

# Step 4: Test baseline
echo "🧪 Step 4: Testing baseline (NO Datadog)..."
echo ""

aws lambda invoke \
  --function-name $FUNCTION_NAME \
  --cli-binary-format raw-in-base64-out \
  --payload '{"httpMethod":"GET","path":"/health","headers":{}}' \
  --region $REGION \
  baseline-test.json > /dev/null

echo "📋 Baseline response:"
cat baseline-test.json | jq '.'
echo ""

# Step 5: Add Datadog
echo "📊 Step 5: Adding Datadog instrumentation..."
echo ""

read -p "Add Datadog layers now? (yes/no): " ADD_DATADOG

if [ "$ADD_DATADOG" == "yes" ]; then
    echo "⚙️  Updating Lambda configuration with Datadog..."

    # Update layers
    aws lambda update-function-configuration \
      --function-name $FUNCTION_NAME \
      --layers \
        $LAYER_ARN \
        arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:67 \
        arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114 \
      --region $REGION > /dev/null

    echo "⏳ Waiting 5s for update..."
    sleep 5

    # Update handler and env vars
    aws lambda update-function-configuration \
      --function-name $FUNCTION_NAME \
      --handler datadog_lambda.handler.handler \
      --environment "Variables={DD_API_KEY=<YOUR_DATADOG_API_KEY>,DD_SITE=datadoghq.com,DD_ENV=lab,DD_SERVICE=fastapi-mangum-test,DD_VERSION=1.0.0,DD_TRACE_ENABLED=true,DD_LOGS_INJECTION=true,DD_LAMBDA_HANDLER=handler.handler,DD_SERVERLESS_LOGS_ENABLED=true,DD_ENHANCED_METRICS=true,DD_TRACE_DEBUG=true,DD_LOG_LEVEL=debug}" \
      --region $REGION > /dev/null

    echo "✅ Datadog configuration applied"
    echo "⏳ Waiting 5s for changes to propagate..."
    sleep 5
    echo ""

    # Test with Datadog
    echo "🧪 Testing with Datadog..."
    for i in {1..3}; do
        echo "  Invocation $i..."
        aws lambda invoke \
          --function-name $FUNCTION_NAME \
          --cli-binary-format raw-in-base64-out \
          --payload '{"httpMethod":"GET","path":"/fibonacci/15","headers":{}}' \
          --region $REGION \
          datadog-test-$i.json > /dev/null
        sleep 2
    done

    echo ""
    echo "📋 Sample response with Datadog:"
    cat datadog-test-1.json | jq '.'
    echo ""

    # Test trace-test endpoint
    echo "🔍 Testing ddtrace endpoint..."
    aws lambda invoke \
      --function-name $FUNCTION_NAME \
      --cli-binary-format raw-in-base64-out \
      --payload '{"httpMethod":"GET","path":"/trace-test","headers":{}}' \
      --region $REGION \
      trace-test.json > /dev/null

    echo "📋 ddtrace info:"
    cat trace-test.json | jq '.body | fromjson'
    echo ""
fi

# Summary
echo "✅ Deployment Complete!"
echo ""
echo "📍 Function: $FUNCTION_NAME"
echo "📍 Region: $REGION"
echo "📍 Account: $(aws sts get-caller-identity --query Account --output text)"
echo ""
echo "🔗 CloudWatch Logs:"
echo "aws logs tail /aws/lambda/$FUNCTION_NAME --follow"
echo ""
echo "🔗 Datadog APM:"
echo "https://app.datadoghq.com/apm/traces?query=service:fastapi-mangum-test"
echo ""
echo "🔗 Datadog Logs:"
echo "https://app.datadoghq.com/logs?query=service:fastapi-mangum-test"
echo ""
