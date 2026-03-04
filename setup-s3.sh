#!/bin/bash
set -e

# ==============================================================================
# INFRASTRUCTURE AUTOMATION - AWS S3 BUCKET + CORS (LOCALSTACK)
#
# Objective: Provision S3 Storage and allow direct browser access via CORS.
# ==============================================================================

ENDPOINT="http://localhost:4566"
REGION="us-east-1"
BUCKET_NAME="meu-bucket-arquivos"

echo "⏳ Initializing S3 Bucket creation: ${BUCKET_NAME} ..."

# 1. Create the Bucket
aws --endpoint-url=${ENDPOINT} --region ${REGION} s3 mb s3://${BUCKET_NAME}

# 2. Configure CORS Policy for the Browser (Vite)
# This is required for our Dashboard to count files successfully via client SDK.
CORS_CONFIG='{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}'

aws --endpoint-url=${ENDPOINT} --region ${REGION} s3api put-bucket-cors --bucket ${BUCKET_NAME} --cors-configuration "$CORS_CONFIG"

echo "✅ S3 Bucket '${BUCKET_NAME}' created and CORS policy applied!"
