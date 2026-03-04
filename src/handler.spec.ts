import { S3Client } from '@aws-sdk/client-s3';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from './handler';

// Mockamos a classe S3Client e seu método 'send' que envia pro nosso Bucket
jest.mock('@aws-sdk/client-s3', () => {
  const mS3Client = { send: jest.fn() };
  return {
    S3Client: jest.fn(() => mS3Client),
    PutObjectCommand: jest.fn(),
  };
});

describe('Lambda S3 Handler', () => {
  let s3ClientMock: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Pega a instnância mockada para validar se o .send foi chamado corretamente
    s3ClientMock = new S3Client({});
  });

  const mockContext = { awsRequestId: 'req-123' } as Context;

  it('deve retornar 400 se não for enviado o body na requisição', async () => {
    const event = { body: null } as APIGatewayProxyEvent;
    
    const result = await handler(event, mockContext);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(400);
    expect(body.message).toContain('Bad Request');
    expect(s3ClientMock.send).not.toHaveBeenCalled();
  });

  it('deve retornar 400 se faltar "filename" ou "content"', async () => {
    const event = { body: JSON.stringify({ filename: 'teste.txt' }) } as unknown as APIGatewayProxyEvent;
    
    const result = await handler(event, mockContext);
    expect(result.statusCode).toBe(400);
    expect(s3ClientMock.send).not.toHaveBeenCalled();
  });

  it('deve retornar 201 e realizar upload no S3 em caso de sucesso', async () => {
    s3ClientMock.send.mockResolvedValueOnce({
      $metadata: { httpStatusCode: 200 }
    });

    const event = { 
      body: JSON.stringify({ filename: 'novo_doc.txt', content: 'Conteúdo interno do doc!' }) 
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(event, mockContext);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(201);
    expect(body.message).toBe('Arquivo salvo no S3 do LocalStack com Sucesso!');
    expect(body.filenameSalvo).toBe('novo_doc.txt');
    expect(s3ClientMock.send).toHaveBeenCalledTimes(1);
  });

  it('deve retornar 500 se ocorrer um erro de conexão com o bucket da AWS S3', async () => {
    s3ClientMock.send.mockRejectedValueOnce(new Error('S3 Access Denied or bucket not found'));

    const event = { 
      body: JSON.stringify({ filename: 'doc.txt', content: 'data' }) 
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(event, mockContext);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toBe('Internal server error (Ocorreu erro ao bater no S3)');
  });
});
