#!/bin/bash

# Deploy Datadog instrumentation to clean-math-lambda

set -e

echo "🚀 Datadog Lambda Instrumentation - Zero Code Changes"
echo "======================================================"
echo ""

# Check if AWS credentials are set
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
echo ""

# Verify Lambda exists
echo "🔍 Checking if Lambda exists..."
aws lambda get-function --function-name clean-math-lambda --region us-east-1 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Lambda 'clean-math-lambda' found"
else
    echo "❌ Lambda 'clean-math-lambda' not found"
    exit 1
fi
echo ""

# Get current handler
CURRENT_HANDLER=$(aws lambda get-function-configuration --function-name clean-math-lambda --region us-east-1 --query 'Handler' --output text)
echo "📋 Current handler: $CURRENT_HANDLER"
echo ""

# Initialize Terraform
echo "🔧 Initializing Terraform..."
terraform init
echo ""

# Show plan
echo "📊 Terraform Plan:"
echo "=================="
terraform plan
echo ""

# Ask for confirmation
read -p "🤔 Apply these changes? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

# Apply
echo ""
echo "⚙️  Applying Terraform..."
terraform apply -auto-approve

# Show outputs
echo ""
echo "📤 Deployment Outputs:"
echo "====================="
terraform output

echo ""
echo "✅ Datadog instrumentation applied!"
echo ""
echo "🧪 Test the Lambda:"
echo "aws lambda invoke \\"
echo "  --function-name clean-math-lambda \\"
echo "  --cli-binary-format raw-in-base64-out \\"
echo "  --payload '{\"operation\":\"fibonacci\",\"number\":20}' \\"
echo "  --region us-east-1 \\"
echo "  response.json && cat response.json | jq '.'"
echo ""
echo "📊 Check Datadog:"
echo "  APM Traces: https://app.datadoghq.com/apm/traces?query=service:clean-math-lambda"
echo "  Logs:       https://app.datadoghq.com/logs?query=service:clean-math-lambda"
echo "  Serverless: https://app.datadoghq.com/functions"
echo ""
