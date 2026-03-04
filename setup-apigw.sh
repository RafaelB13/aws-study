#!/bin/bash
set -e

# ==============================================================================
# SCRIPT DE AUTOMAÇÃO - CRIAÇÃO DE UM API GATEWAY NA NUVEM / LOCALSTACK
#
# Objetivo: Criar as "Portas de Entrada" públicas (Urls) que se comunicam 
# com a nossa Lambda escondida. Vamos simular tudo usando nosso docker LocalStack.
# ==============================================================================

# Variáveis Base
ENDPOINT="http://localhost:4566"        # Onde o painel da nossa nuvem falsa está rodando.
REGION="us-east-1"                      # Em qual estado dos EUA nosso servidor vai "alocar" a máquina.
REGION_FLAG="--region $REGION --endpoint-url=$ENDPOINT" # Usamos muito na linha de comando pra enviar pro Localstack invés do servidor oficial
LAMBDA_NAME="my-lambda"                 # Nome que demos pra nossa lambda rodando lá dentro.
API_NAME="my-api"

echo "1. Criando um novo conjunto de API (Rest API) do zero..."
# --query 'id': Significa que queremos extrair SÓ o ID gerado e ignorar o resto da string json retornada da nuvem.
# Esse id é a espinha dorsal de todo o resto. Guardamos na variável $API_ID.
API_ID=$(aws apigateway create-rest-api $REGION_FLAG --name "$API_NAME" --query 'id' --output text)
echo "   ✅ API Group ID: $API_ID criado."

echo "2. Procurando pelo endereço Raiz..."
# Toda API tem um endereço base '/' (Por exemplo, aws.com/). 
# Precisamos descobrir o ID dessa raiz (Parent Id) para atachar pastas subjacentes.
PARENT_ID=$(aws apigateway get-resources $REGION_FLAG --rest-api-id $API_ID --query "items[?path=='/'].id" --output text)
echo "   ✅ Root Resource ID encontrado: $PARENT_ID"

echo "3. Criando nossa Rota real (O /hello) dentro da raiz (/)..."
# Criamos um Caminho Virtual (Resource Part) conectando a nossa Raiz. 
# Ex: site.com/hello (O '/hello' é o nosso novo Resource_ID).
RESOURCE_ID=$(aws apigateway create-resource $REGION_FLAG --rest-api-id $API_ID --parent-id $PARENT_ID --path-part "hello" --query 'id' --output text)
echo "   ✅ Sub-pasta /hello criada com Resource ID: $RESOURCE_ID"

echo "4. Informando o Método (GET, POST, PUT?)..."
# Dizemos que em `/hello` a nossa API Gateway apenars vai aceitar envios de dados através da porta POST.
# Sem autenticação ou tokens de segurança (authorization NONE).
aws apigateway put-method $REGION_FLAG --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method POST --authorization-type "NONE" > /dev/null

echo "5. Fazendo a CONEXÃO (Integração) do Caminho com a Lambda..."
# Aqui mora o segredo. Dizemos à URL para chamar o Lambda_Arn específico quando "baterem na porta".
ACCOUNT_ID="000000000000" # LocalStack sempre usa esse número fake como sua 'conta AWS'.
LAMBDA_ARN="arn:aws:lambda:$REGION:$ACCOUNT_ID:function:$LAMBDA_NAME" # Forma da AWS de achar coisas. arn:aws:serviço:região:conta:coisa

# Note: O type AWS_PROXY (Muito Famoso) diz ao API Gateway para repassar ABSOLUTAMENTE TUDO (Headers, ips, raw json) num pacotão mastigado pro evento (Event) da Lambda.
aws apigateway put-integration $REGION_FLAG \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations" > /dev/null

echo "6. Adicionando Headers de CORS (Verbo OPTIONS de Preflight do Navegador)..."
# 1. Liberamos um endpoint pro método OPTIONS existir pra quem faz uso em navegadores.
aws apigateway put-method $REGION_FLAG --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --authorization-type "NONE" > /dev/null

# 2. Quando o OPTIONS bater, conectamos tudo a uma resposta finta "MOCK" do proprio ApiGateway (já que a Lambda não precisa trabalhar).
aws apigateway put-integration $REGION_FLAG \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --type MOCK \
  --request-templates '{"application/json":"{\"statusCode\": 200}"}' > /dev/null

# 3. Criamos a Resposta 200 pro Cliente do Method OPTIONS 
aws apigateway put-method-response $REGION_FLAG \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-models '{"application/json":"Empty"}' \
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers":true,"method.response.header.Access-Control-Allow-Methods":true,"method.response.header.Access-Control-Allow-Origin":true}' > /dev/null

# 4. Inserimos os Headers de CORS reais na Integração do Mock
aws apigateway put-integration-response $REGION_FLAG \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"'\''Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\''","method.response.header.Access-Control-Allow-Methods":"'\''GET,OPTIONS,POST,PUT'\''","method.response.header.Access-Control-Allow-Origin":"'\''*'\''"}' \
  --response-templates '{"application/json":""}' > /dev/null

echo "7. Implantando a API pro mundo exterior acessar (Deploy para 'Stage')..."
# Toda API tem estagios (dev, hml, prod). Criamos o estágio 'dev' que libera a URL definitivamente pra acesso do curl.
aws apigateway create-deployment $REGION_FLAG --rest-api-id $API_ID --stage-name dev > /dev/null

echo ""
echo "============================================="
echo "🎊 API Gateway Setup Concluído com Sucesso!"
echo "Você pode agora fazer envios via POST pra sua Lambda rodando no localstack usando esse link:"
echo ""
echo "URL do Postman:"
echo "http://localhost:4566/restapis/$API_ID/dev/_user_request_/hello"
echo "============================================="
