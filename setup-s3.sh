#!/bin/bash
set -e

# ==============================================================================
# SCRIPT DE AUTOMAÇÃO - AWS S3 BUCKET
# Objetivo: Provisionar nosso cofre/pasta de fotos/arquivos base
# no servidor falso do LocalStack.
# ==============================================================================

# O endpoint padrão para todos os serviços que testamos no Docker LocalStack (S3, Lambda, IAM, API Gateway).
ENDPOINT="http://localhost:4566"
REGION="us-east-1"
BUCKET_NAME="meu-bucket-arquivos"

echo "⏳ Iniciando criação do Bucket S3: ${BUCKET_NAME} ..."

# Utilizamos o comando Make Bucket (mb) da linha de comando da AWS.
#
# Isso diz: "Amazon, por favor, use o S3 e Crie um Bucket (MakeBucket -> mb)
# que seja universalmente alcançável nas urls por s3://nome-do-bucket"
aws --endpoint-url=${ENDPOINT} --region ${REGION} s3 mb s3://${BUCKET_NAME}

echo "✅ S3 Bucket '${BUCKET_NAME}' ativado com sucesso!"
echo "✅ Sua AWS Lambda agora pode usar a biblioteca SDK e disparar SendObjectCommand para essa pasta."
