#!/bin/bash

# Script para testar a função Lambda
# Usage: ./test-lambda.sh [action]

set -e

FUNCTION_NAME="datadog-apm-lab-python"
PAYLOADS_DIR="payloads"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🧪 Lambda Test Script"
echo "===================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

# Function to invoke Lambda
invoke_lambda() {
    local action=$1
    local payload_file="${PAYLOADS_DIR}/${action}.json"
    local response_file="response-${action}.json"

    if [ ! -f "$payload_file" ]; then
        echo -e "${RED}❌ Payload file not found: ${payload_file}${NC}"
        return 1
    fi

    echo -e "${YELLOW}📤 Invoking Lambda with action: ${action}${NC}"
    echo "Payload: ${payload_file}"
    echo ""

    aws lambda invoke \
        --function-name "$FUNCTION_NAME" \
        --payload file://"$payload_file" \
        "$response_file" \
        --cli-binary-format raw-in-base64-out

    echo ""
    echo -e "${GREEN}✅ Response saved to: ${response_file}${NC}"
    echo ""
    echo "📋 Response:"
    cat "$response_file" | jq '.' 2>/dev/null || cat "$response_file"
    echo ""
}

# Function to run all tests
run_all_tests() {
    echo -e "${YELLOW}🚀 Running all tests...${NC}"
    echo ""

    local actions=("health" "process-order" "fetch-data" "calculate")

    for action in "${actions[@]}"; do
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        invoke_lambda "$action"
        sleep 1
    done

    echo -e "${GREEN}✅ All tests completed!${NC}"
    echo ""
    echo "📊 View traces in Datadog:"
    echo "https://app.datadoghq.com/apm/services"
}

# Function to tail logs
tail_logs() {
    echo -e "${YELLOW}📝 Tailing CloudWatch logs...${NC}"
    echo "Press Ctrl+C to stop"
    echo ""

    aws logs tail "/aws/lambda/${FUNCTION_NAME}" --follow
}

# Function to show recent logs
show_logs() {
    echo -e "${YELLOW}📝 Recent logs (last 10 minutes)${NC}"
    echo ""

    aws logs tail "/aws/lambda/${FUNCTION_NAME}" \
        --since 10m \
        --format short
}

# Main menu
if [ $# -eq 0 ]; then
    echo "Available actions:"
    echo ""
    echo "  ./test-lambda.sh health           # Health check"
    echo "  ./test-lambda.sh process-order    # Process order"
    echo "  ./test-lambda.sh fetch-data       # Fetch external data"
    echo "  ./test-lambda.sh calculate        # Calculate Fibonacci"
    echo "  ./test-lambda.sh simulate-error   # Simulate error"
    echo ""
    echo "  ./test-lambda.sh all              # Run all tests"
    echo "  ./test-lambda.sh logs             # Show recent logs"
    echo "  ./test-lambda.sh tail             # Tail logs (live)"
    echo ""
    exit 0
fi

ACTION=$1

case "$ACTION" in
    all)
        run_all_tests
        ;;
    logs)
        show_logs
        ;;
    tail)
        tail_logs
        ;;
    *)
        invoke_lambda "$ACTION"
        ;;
esac
