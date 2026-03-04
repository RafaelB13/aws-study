import { S3Client } from '@aws-sdk/client-s3';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from './handler';

// ==========================================
// 1. MOCKING (SIMULANDO COISAS QUE NÃO TEMOS)
// ==========================================

// Em testes de unidade (Unit tests), a regra de ouro é: "Testar apenas O SEU CÓDIGO de forma isolada".
// Nós não queremos que um teste bata de verdade num servidor AWS e nem no LocalStack.
// O "jest.mock" intercepta a biblioteca do provedor da nuvem (@aws-sdk/client-s3) e a substitui por um dublê.
jest.mock('@aws-sdk/client-s3', () => {
  // Criamos uma função de mentira ("fn()") para o método ".send()" fingir que enviou.
  const mS3Client = { send: jest.fn() }; 
  return {
    S3Client: jest.fn(() => mS3Client), // Substitui a Classe real pelo nosso dublê
    PutObjectCommand: jest.fn(),
  };
});

describe('Lambda S3 Handler', () => {
  let s3ClientMock: any;

  // o beforeEach roda antes de CADA teste individual (os 'it')
  beforeEach(() => {
    // Limpamos o histórico de chamadas do dublê para um teste não poluir as contagens do outro.
    jest.clearAllMocks();
    
    // Isso silencia os console.logs do seu arquivo oficial pra não spammar o terminal rodando "npm test".
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Guardamos a instância mockada da S3 para podermos checar futuramente se os métodos dela foram disparados
    s3ClientMock = new S3Client({});
  });

  // Criamos um Context falso de brincadeirinha já que quem criaria isso de verdade
  // seria própria infraestrutura da AWS (não nós mesmos testando no jest).
  const mockContext = { awsRequestId: 'req-123' } as Context;


  // ==========================================
  // 2. OS TESTES EM SI (Cenários Reais)
  // ==========================================

  it('deve retornar 400 se não for enviado o body na requisição', async () => {
    // Montamos o nosso evento chegando supostamente vindo do API Gateway. 
    // Desta vez de propósito passamos null no Body.
    const event = { body: null } as APIGatewayProxyEvent;
    
    // Jogamos na porta de entrada da nossa Lambda!
    const result = await handler(event, mockContext);
    
    // Lemos a reposta voltando
    const body = JSON.parse(result.body);

    // Validações (Asserts) - A parte que faz o teste Passar ou Falhar:
    expect(result.statusCode).toBe(400); // Exigimos que nossa aplicação tenha respondido um BadRequest de volta
    expect(body.message).toContain('Bad Request'); // Exigimos que tenha retornado a exata mensagem 
    expect(s3ClientMock.send).not.toHaveBeenCalled(); // Muito Importante: Exigimos a certeza de que a Lambda bloqueou e NÃO tentou conversar com a Amazon S3 pois os dados vieram vazios!
  });

  it('deve retornar 400 se faltar "filename" ou "content"', async () => {
    // Teste para ver se falta de atributos também bloqueia a requisição inteira.
    const event = { body: JSON.stringify({ filename: 'teste.txt' }) } as unknown as APIGatewayProxyEvent;
    
    const result = await handler(event, mockContext);
    expect(result.statusCode).toBe(400);
    expect(s3ClientMock.send).not.toHaveBeenCalled(); // Validando a segurança de novo
  });


  // --------------------------------------------------------------------------
  it('deve retornar 201 e realizar upload no S3 em caso de sucesso', async () => {
    // Aqui nós dizemos ao dublê da S3 (Mock): Caso peçam pra você rodar o método '.send()', 
    // Diga que você completou a promessa (ResolvedValue) enviando HttpStatusCode 200 pro garoto!
    s3ClientMock.send.mockResolvedValueOnce({
      $metadata: { httpStatusCode: 200 }
    });

    // Cenário Perfeito: Evento chegou com Body preenchidinho e em formato de texto JSON.
    const event = { 
      body: JSON.stringify({ filename: 'novo_doc.txt', content: 'Conteúdo interno do doc!' }) 
    } as unknown as APIGatewayProxyEvent;

    // A Lambda executa!
    const result = await handler(event, mockContext);
    const body = JSON.parse(result.body);

    // Validamos que retornou statuscode de Criação (201)
    expect(result.statusCode).toBe(201);
    expect(body.message).toBe('Arquivo salvo no S3 do LocalStack com Sucesso!');
    // Validamos que o envio da AWS Amazon, nos bastidores da amazon (do s3Client), bateu e chamou 1 exata única vez. 
    expect(s3ClientMock.send).toHaveBeenCalledTimes(1);
  });


  // --------------------------------------------------------------------------
  it('deve retornar 500 se ocorrer um erro de conexão com o bucket da AWS S3', async () => {
    // Aqui dizemos ao dublê do S3: Se o método '.send()' for chamado, de propósito CRASHE O SISTEMA com um ERRO! 
    // É uma falha no lado do cozinheiro/infraestrutura (ex: S3 Caiu ou faltou credencial).
    s3ClientMock.send.mockRejectedValueOnce(new Error('S3 Access Denied or bucket not found'));

    const event = { 
      body: JSON.stringify({ filename: 'doc.txt', content: 'data' }) 
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(event, mockContext);

    // Como é um erro interno do servidor que a gente cuidou usando Bloco Catch, nós devolvemos statuscode 500
    expect(result.statusCode).toBe(500);
    // Mas a gente captura isso educadamente de forma customizada pra passar na mensagem.
    expect(JSON.parse(result.body).message).toBe('Internal server error (Ocorreu erro ao bater no S3)');
  });
});
