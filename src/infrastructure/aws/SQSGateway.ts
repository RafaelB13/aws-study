import { GetQueueAttributesCommand, SendMessageCommand, SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs';
import { IQueueGateway } from '@src/application/interfaces/Gateways';
import { Order } from '@src/domain/entities';

export class SQSGateway implements IQueueGateway {
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;

  constructor(endpoint?: string) {
    // SMART SDK: Se estivermos no LocalStack, usamos o endpoint local. 
    // Na AWS Real (sem endpoint passado), o SDK descobre tudo sozinho.
    const isLocal = !!process.env.LOCALSTACK_HOSTNAME || (endpoint && endpoint.includes('localhost'));
    
    const config: SQSClientConfig = {
      region: 'us-east-1',
    };

    if (isLocal && endpoint) {
      config.endpoint = endpoint;
      config.credentials = { accessKeyId: 'test', secretAccessKey: 'test' };
    }

    this.sqsClient = new SQSClient(config);
    
    // Na AWS Real, usamos apenas o nome da fila ou uma variável de ambiente
    const queueName = 'minha-fila-arquivos';
    this.queueUrl = isLocal && endpoint 
      ? `${endpoint}/000000000000/${queueName}`
      : `https://sqs.us-east-1.amazonaws.com/${process.env.AWS_ACCOUNT_ID || '000000000000'}/${queueName}`;
  }

  async sendToQueue(order: Order): Promise<void> {
    await this.sqsClient.send(new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(order)
    }));
  }

  async getQueueMetrics(): Promise<number> {
    try {
      const res = await this.sqsClient.send(new GetQueueAttributesCommand({
        QueueUrl: this.queueUrl,
        AttributeNames: ['ApproximateNumberOfMessages']
      }));
      return parseInt(res.Attributes?.['ApproximateNumberOfMessages'] || '0');
    } catch (error) {
      console.error('Error fetching SQS metrics:', error);
      return 0;
    }
  }
}
