#!/bin/bash
set -e

ENDPOINT="http://localhost:4566"
REGION="us-east-1"
BUCKET_NAME="meu-bucket-arquivos"

echo "⏳ Criando Bucket S3: ${BUCKET_NAME} no LocalStack..."

# Utilizamos o comando Make Bucket (mb)
aws --endpoint-url=${ENDPOINT} --region us-east-1 s3 mb s3://${BUCKET_NAME}

echo "✅ S3 Bucket '${BUCKET_NAME}' pronto para uso no simulador!"
