#!/bin/bash
set -e

# ==============================================================================
# MASTER START SCRIPT - "THE BIG RED BUTTON"
# This script orchestrates Docker, AWS Infrastructure (LocalStack), and Frontend.
# ==============================================================================

echo "--------------------------------------------------------"
echo "🚀 STARTING THE ENTIRE SERVERLESS ECOSYSTEM..."
echo "--------------------------------------------------------"

# 1. Start LocalStack (Docker)
echo "🐳 Step 1: Starting LocalStack via Docker Compose..."
docker compose up -d

# 2. Wait for LocalStack to be 100% ready
echo "⏳ Step 2: Waiting for LocalStack services to be healthy (S3, SQS, Lambda)..."
until curl -s http://localhost:4566/_localstack/health | grep -q "\"s3\": \"\(running\|available\)\""; do
    sleep 2
    echo "   ...still waiting for LocalStack..."
done
echo "✅ LocalStack is UP and Running!"

# 3. Provision S3
echo "📦 Step 3: Provisioning S3 Bucket..."
npm run s3:local > /dev/null

# 4. Build and Deploy Lambdas (Smart Deploy/Update)
echo "🚀 Step 4: Building and Deploying Lambdas..."
npm run build:zip > /dev/null

# Check if functions already exist to decide between Create or Update
if aws --endpoint-url=http://localhost:4566 --region us-east-1 lambda get-function --function-name my-producer-lambda > /dev/null 2>&1; then
    echo "   📍 Lambdas already exist. Updating source code..."
    aws --endpoint-url=http://localhost:4566 --region us-east-1 lambda update-function-code --function-name my-producer-lambda --zip-file fileb://function.zip > /dev/null
    aws --endpoint-url=http://localhost:4566 --region us-east-1 lambda update-function-code --function-name my-consumer-lambda --zip-file fileb://function.zip > /dev/null
else
    echo "   📍 Creating new Lambdas..."
    aws --endpoint-url=http://localhost:4566 --region us-east-1 lambda create-function --function-name my-producer-lambda --runtime nodejs18.x --handler src/presentation/lambda/producer.handler --role arn:aws:iam::000000000000:role/irrelevant --zip-file fileb://function.zip > /dev/null
    aws --endpoint-url=http://localhost:4566 --region us-east-1 lambda create-function --function-name my-consumer-lambda --runtime nodejs18.x --handler src/presentation/lambda/consumer.handler --role arn:aws:iam::000000000000:role/irrelevant --zip-file fileb://function.zip > /dev/null
fi

# 5. Provision SQS & Trigger
echo "📩 Step 5: Provisioning SQS Queue & Lambda Triggers..."
npm run sqs:local > /dev/null

# 6. Provision API Gateway
echo "🌐 Step 6: Provisioning API Gateway & CORS..."
npm run api:local > /dev/null

echo "--------------------------------------------------------"
echo "✨ INFRASTRUCTURE READY!"
echo "--------------------------------------------------------"
echo "🔥 Starting Vite (React) Frontend..."
npm run dev
