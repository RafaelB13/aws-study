import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

// Client configurado para bater na porta do LocalStack de DENTRO do container da Lambda
const endpoint = process.env.LOCALSTACK_HOSTNAME 
  ? `http://${process.env.LOCALSTACK_HOSTNAME}:4566` 
  : 'http://localhost.localstack.cloud:4566';

const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: endpoint, // Usa o DNS interno do Docker do LocalStack
  forcePathStyle: true, // Obrigatório p/ LocalStack S3 (s3://bucket/key ao invés de bucket.s3.amazonaws.com)
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' } // Fake p/ LocalStack
});

const BUCKET_NAME = 'meu-bucket-arquivos';

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    const body = event.body ? JSON.parse(event.body) : null;
    
    // Validação básica do body para arquivo
    if (!body || !body.filename || !body.content) {
      return buildResponse(400, {
        message: 'Bad Request: Envie um JSON com "filename" e "content"',
      });
    }

    // Criando comando para realizar o envio "PutObject" para o S3
    const putObjectParams = {
      Bucket: BUCKET_NAME,
      Key: body.filename, // Nome e extensão do arquivo a ser salvo
      Body: body.content, // O "peso" ou conteúdo do Arquivo em si
      ContentType: 'text/plain',
    };
    
    console.log(`Enviando arquivo ${body.filename} para o bucket ${BUCKET_NAME}...`);
    
    // Executando no LocalStack S3
    await s3Client.send(new PutObjectCommand(putObjectParams));

    return buildResponse(201, {
      message: 'Arquivo salvo no S3 do LocalStack com Sucesso!',
      filenameSalvo: body.filename,
      bucket: BUCKET_NAME,
      requestId: context.awsRequestId
    });

  } catch (error) {
    console.error('Erro na tentadia de enviar arquivo:', error);
    
    return buildResponse(500, {
      message: 'Internal server error (Ocorreu erro ao bater no S3)',
    });
  }
};

const buildResponse = (statusCode: number, body: Record<string, unknown>): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  };
};
