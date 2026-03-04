import { GetQueueAttributesCommand, SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { IQueueGateway } from '@src/application/interfaces/Gateways';
import { Order } from '@src/domain/entities';

export class SQSGateway implements IQueueGateway {
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;

  constructor(endpoint: string) {
    this.sqsClient = new SQSClient({
      region: 'us-east-1',
      endpoint: endpoint,
      credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
    });
    this.queueUrl = `${endpoint}/000000000000/minha-fila-arquivos`;
  }

  async sendToQueue(order: Order): Promise<void> {
    await this.sqsClient.send(new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(order)
    }));
  }

  async getQueueMetrics(): Promise<number> {
    const res = await this.sqsClient.send(new GetQueueAttributesCommand({
      QueueUrl: this.queueUrl,
      AttributeNames: ['ApproximateNumberOfMessages']
    }));
    return parseInt(res.Attributes?.['ApproximateNumberOfMessages'] || '0');
  }
}
