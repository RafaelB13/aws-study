#!/bin/bash
set -e

# ==============================================================================
# INFRASTRUCTURE AUTOMATION - API GATEWAY PROVISIONING (LOCALSTACK)
#
# Objective: Create public entry points (URLs) that communicate with 
# our hidden Producer Lambda. Everything is emulated via Docker LocalStack.
# ==============================================================================

# Base Variables
ENDPOINT="http://localhost:4566"        # Fake cloud panel endpoint
REGION="us-east-1"                      # Mock AWS region
REGION_FLAG="--region $REGION --endpoint-url=$ENDPOINT"
API_NAME="my-api"

echo "1. Creating a new Rest API setup..."
API_ID=$(aws apigateway create-rest-api $REGION_FLAG --name "$API_NAME" --query 'id' --output text)
echo "   ✅ API Group Created with ID: $API_ID"

echo "2. Finding the Root Resource address..."
PARENT_ID=$(aws apigateway get-resources $REGION_FLAG --rest-api-id $API_ID --query "items[?path=='/'].id" --output text)
echo "   ✅ Root Resource ID found: $PARENT_ID"

echo "3. Creating the actual route (/hello) inside the root (/)..."
RESOURCE_ID=$(aws apigateway create-resource $REGION_FLAG --rest-api-id $API_ID --parent-id $PARENT_ID --path-part "hello" --query 'id' --output text)
echo "   ✅ Resource /hello created with ID: $RESOURCE_ID"

echo "4. Defining Methods (POST for Orders, GET for Status)..."
# We define allowed HTTP verbs for our endpoint.
aws apigateway put-method $REGION_FLAG --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method POST --authorization-type "NONE" > /dev/null
aws apigateway put-method $REGION_FLAG --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method GET --authorization-type "NONE" > /dev/null

echo "5. Connecting the Route with the Producer Lambda..."
ACCOUNT_ID="000000000000" # LocalStack default account ID
LAMBDA_ARN="arn:aws:lambda:$REGION:$ACCOUNT_ID:function:my-producer-lambda"

# Integration for POST (Order Dispatch)
aws apigateway put-integration $REGION_FLAG \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations" > /dev/null

# Integration for GET (Status Monitoring)
aws apigateway put-integration $REGION_FLAG \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations" > /dev/null

echo "6. Configuring CORS Headers (Preflight OPTIONS)..."
# 1. Enable OPTIONS method for the browser pre-flight checks.
aws apigateway put-method $REGION_FLAG --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --authorization-type "NONE" > /dev/null

# 2. Connect OPTIONS to a Mock response (no Lambda execution needed here).
aws apigateway put-integration $REGION_FLAG \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --type MOCK \
  --request-templates '{"application/json":"{\"statusCode\": 200}"}' > /dev/null

# 3. Create Method Response
aws apigateway put-method-response $REGION_FLAG \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-models '{"application/json":"Empty"}' \
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers":true,"method.response.header.Access-Control-Allow-Methods":true,"method.response.header.Access-Control-Allow-Origin":true}' > /dev/null

# 4. Inject CORS headers parameters
aws apigateway put-integration-response $REGION_FLAG \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"'\''Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\''","method.response.header.Access-Control-Allow-Methods":"'\''GET,OPTIONS,POST,PUT'\''","method.response.header.Access-Control-Allow-Origin":"'\''*'\''"}' \
  --response-templates '{"application/json":""}' > /dev/null

echo "7. Deploying API to Stage 'dev'..."
aws apigateway create-deployment $REGION_FLAG --rest-api-id $API_ID --stage-name dev > /dev/null

echo ""
echo "============================================="
echo "🎊 API Gateway Setup Completed!"
echo "New Base URL Generated:"
echo "http://localhost:4566/restapis/$API_ID/dev/_user_request_/hello"
echo "============================================="

# ✨ VITE INTEGRATION: Exporting the URL to .env.local automatically
echo "VITE_API_URL=http://localhost:4566/restapis/$API_ID/dev/_user_request_/hello" > .env.local
echo "✅ .env.local file updated. Frontend will automatically detect the new URL!"
