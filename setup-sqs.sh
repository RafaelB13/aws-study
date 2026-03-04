#!/bin/bash
set -e

# ==============================================================================
# INFRASTRUCTURE AUTOMATION - AWS SQS (SIMPLE QUEUE SERVICE)
# Objective: Create a "Message Queue" to simulate asynchronous ingestion.
# ==============================================================================

ENDPOINT="http://localhost:4566"
REGION="us-east-1"
REGION_FLAG="--region $REGION --endpoint-url=$ENDPOINT"

QUEUE_NAME="minha-fila-arquivos"
CONSUMER_LAMBDA_NAME="my-consumer-lambda"

echo "⏳ 1. Creating SQS Queue: ${QUEUE_NAME} on LocalStack..."

# 1. Create the queue and extract its URL
QUEUE_URL=$(aws sqs create-queue $REGION_FLAG --queue-name $QUEUE_NAME --query 'QueueUrl' --output text)
echo "   ✅ Queue successfully created:"
echo "   URL: $QUEUE_URL"

echo "⏳ 2. Retrieving Queue ARN (Resource Name)..."
# The Queue ARN is mandatory to link the queue as an event source for the Consumer Lambda.
QUEUE_ARN=$(aws sqs get-queue-attributes $REGION_FLAG --queue-url $QUEUE_URL --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)
echo "   ✅ Queue ARN: $QUEUE_ARN"

echo "⏳ 3. Configuring Event Source Mapping (Lambda Trigger)..."
# We connect the SQS Queue directly to our Consumer Lambda so it wakes up 
# automatically whenever new messages arrive.
ACCOUNT_ID="000000000000"
LAMBDA_ARN="arn:aws:lambda:$REGION:$ACCOUNT_ID:function:$CONSUMER_LAMBDA_NAME"

aws lambda create-event-source-mapping $REGION_FLAG \
    --function-name $LAMBDA_ARN \
    --batch-size 10 \
    --event-source-arn $QUEUE_ARN > /dev/null

echo "✅ ALL CONNECTED! Queue '$QUEUE_NAME' is now triggering Lambda '$CONSUMER_LAMBDA_NAME'."
echo "--------------------------------------------------------"
