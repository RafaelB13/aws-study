#!/bin/bash
set -e

ENDPOINT="http://localhost:4566"
REGION="us-east-1"
REGION_FLAG="--region $REGION --endpoint-url=$ENDPOINT"
LAMBDA_NAME="my-lambda"
API_NAME="my-api"

echo "Creating Rest API..."
API_ID=$(aws apigateway create-rest-api $REGION_FLAG --name "$API_NAME" --query 'id' --output text)
echo "API ID: $API_ID"

echo "Getting root resource ID..."
PARENT_ID=$(aws apigateway get-resources $REGION_FLAG --rest-api-id $API_ID --query "items[?path=='/'].id" --output text)
echo "Root Resource ID: $PARENT_ID"

echo "Creating /hello resource..."
RESOURCE_ID=$(aws apigateway create-resource $REGION_FLAG --rest-api-id $API_ID --parent-id $PARENT_ID --path-part "hello" --query 'id' --output text)
echo "Resource ID: $RESOURCE_ID"

echo "Creating POST method..."
aws apigateway put-method $REGION_FLAG --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method POST --authorization-type "NONE" > /dev/null

echo "Creating Lambda Integration..."
ACCOUNT_ID="000000000000"
LAMBDA_ARN="arn:aws:lambda:$REGION:$ACCOUNT_ID:function:$LAMBDA_NAME"

aws apigateway put-integration $REGION_FLAG \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations" > /dev/null

echo "Deploying API to 'dev' stage..."
aws apigateway create-deployment $REGION_FLAG --rest-api-id $API_ID --stage-name dev > /dev/null

echo ""
echo "✅ API Gateway Setup Complete!"
echo "You can now test your Lambda via HTTP in your browser or with curl:"
echo ""
echo "URL: http://localhost:4566/restapis/$API_ID/dev/_user_request_/hello"
echo ""
echo "To test with curl:"
echo "curl http://localhost:4566/restapis/$API_ID/dev/_user_request_/hello"
