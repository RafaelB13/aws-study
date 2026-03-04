import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

// ==========================================
// 1. CONFIGURAÇÃO DE CONEXÃO (AWS SDK v3)
// ==========================================

// Como estamos rodando dentro do Docker (simulador LocalStack) em vez da nuvem real da AWS,
// precisamos dizer para o nosso código Node.js exatamente ONDE o S3 "falso" está escutando.
const endpoint = process.env.LOCALSTACK_HOSTNAME 
  ? `http://${process.env.LOCALSTACK_HOSTNAME}:4566` // Aqui ele pega o IP do docker interno (quando rodando pela Lambda)
  : 'http://localhost.localstack.cloud:4566';        // Aqui caso rodemos testes de fora do docker

// Instanciamos o "Cliente do S3", que é a nossa ferramenta para falar com o serviço de armazenamento.
const s3Client = new S3Client({
  region: 'us-east-1', // Região padrão de testes
  endpoint: endpoint,  // O endereço do LocalStack que definimos acima
  forcePathStyle: true, // Configuração OBRIGATÓRIA para o LocalStack (muda o jeito que ele monta a URL do bucket)
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' } // Credenciais falsas pois o LocalStack não exige login real
});

// O nome do nosso Bucket (nossa pasta gigante na nuvem) que criamos previamente no LocalStack
const BUCKET_NAME = 'meu-bucket-arquivos';


// ==========================================
// 2. CÓDIGO PRINCIPAL DA NOSSA LAMBDA
// ==========================================

// O 'handler' é a nossa função principal. É a porta de entrada. Quando o API Gateway chamar
// a Lambda, a execução vai iniciar EXATAMENTE por essa linha.
// Recebemos dois parâmetros:
// - event: Tudo o que o cliente enviou pra gente (Headers HTTP, Body, URL acessada, IPs, etc).
// - context: Informações da própria máquina Lambda rodando (Tempo limite, Id da requisição, etc).
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    // 1º Passo: Extrair os dados.
    // O API Gateway envia o conteúdo do POST (o Body) em formato de TEXTO (String HTML). 
    // Precisamos pegar esse texto e converter (fazer o parse) para um Objeto JavaScript real usando JSON.parse.
    const body = event.body ? JSON.parse(event.body) : null;
    
    // 2º Passo: Validação.
    // Se o cliente (ex: Postman) mandou uma requisição vazia ou faltando as propriedades que precisamos,
    // nós abortamos a missão e devolvemos um erro 400 (Bad Request).
    if (!body || !body.filename || !body.content) {
      return buildResponse(400, {
        message: 'Bad Request: Envie um JSON com "filename" e "content"',
      });
    }

    // 3º Passo: Preparar o envelope para o S3.
    // Para mandar algo pro S3 através do SDK, precisamos montar um objeto de configuração
    // avisando o Bucket de destino, o Nome (Key) do arquivo e o que vai dentro do arquivo (Body).
    const putObjectParams = {
      Bucket: BUCKET_NAME,
      Key: body.filename, // Nome e extensão do arquivo a ser salvo (Ex: "foto.png", "relatorio.txt")
      Body: body.content, // O conteúdo que vai ser escrito dentro desse arquivo
      ContentType: 'text/plain', // Como é um projeto simples em texto, definimos como 'text/plain'
    };
    
    console.log(`Enviando arquivo ${body.filename} para o bucket ${BUCKET_NAME}...`);
    
    // 4º Passo: Ação.
    // Usamos nosso Cliente configurado lá em cima para enviar o 'Comando de Inserir Objeto' (PutObject).
    // O "await" significa que a AWS Lambda vai esperar essa promessa de envio do arquivo terminar
    // antes de prosseguir com a linha de baixo.
    await s3Client.send(new PutObjectCommand(putObjectParams));

    // 5º Passo: Resposta de Sucesso.
    // Se o código chegou até aqui, significa que o S3 não retornou nenhum erro.
    // O arquivo foi salvo! Devolvemos para quem chamou a API um status 201 (Created) e informações adicionais JSON.
    return buildResponse(201, {
      message: 'Arquivo salvo no S3 do LocalStack com Sucesso!',
      filenameSalvo: body.filename,
      bucket: BUCKET_NAME,
      requestId: context.awsRequestId // Útil para debugar logs de execução em casos de problema
    });

  } catch (error) {
    // Se alguma coisa quebrar a promessa do await do S3 (ou falha no JSON.parse), o código cai no bloco 'catch'.
    console.error('Erro na tentadia de enviar arquivo:', error);
    
    // Retornamos 500 (Internal Server Error) pro cliente não ficar esperando para sempre.
    return buildResponse(500, {
      message: 'Internal server error (Ocorreu erro ao bater no S3)',
    });
  }
};


// ==========================================
// 3. FUNÇÃO AUXILIAR
// ==========================================

// Esta é uma função ajudante que criamos para não precisarmos ficar digitando 
// 'statusCode', 'headers' e transformando as coisas em JSON toda hora nos retornos (returns) acima.
// - statusCode: O número HTTP (200 OK, 201 Created, 400 Bad Request, 500 Interna Error).
// - body: O objeto JavaScript que queremos entregar com as mensagens e dados.
const buildResponse = (statusCode: number, body: Record<string, unknown>): APIGatewayProxyResult => {
  return {
    statusCode,   // Devolve o número HTTP pra requisição original (Postman)
    headers: {
      'Content-Type': 'application/json', // Avisa o navegador que nossa linguagem de bate-papo será em JSON
      'Access-Control-Allow-Origin': '*', // Configuração de CORS: Permite que sites de outras URLs chamem a nossa API direto pelo Frontend Vue/React s/ bloqueio.
    },
    body: JSON.stringify(body), // Transforma de volta nosso objeto limpo em "Textão contínuo de JSON" (Pois é assim que se entrega pacotes via TCP na web).
  };
};
