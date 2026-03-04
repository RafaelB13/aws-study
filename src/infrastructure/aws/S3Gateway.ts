import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { IStorageGateway } from '@src/application/interfaces/Gateways';
import { Order } from '@src/domain/entities';

export class S3Gateway implements IStorageGateway {
  private readonly s3Client: S3Client;
  private readonly bucketName = process.env.ORDER_BUCKET_NAME || 'meu-bucket-arquivos';

  constructor(endpoint?: string) {
    const isLocal = !!process.env.LOCALSTACK_HOSTNAME || (endpoint && endpoint.includes('localhost'));
    const config: S3ClientConfig = { region: 'us-east-1' };
    if (isLocal && endpoint) {
      config.endpoint = endpoint;
      config.forcePathStyle = true;
      config.credentials = { accessKeyId: 'test', secretAccessKey: 'test' };
    }
    this.s3Client = new S3Client(config);
  }

  async saveOrder(order: Order): Promise<void> {
    const enrichedOrder: Order = {
      ...order,
      status: 'PROCESSED',
      processedAt: new Date().toISOString()
    };
    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `${order.orderId}.json`,
      Body: JSON.stringify(enrichedOrder, null, 2),
      ContentType: 'application/json',
    }));
  }

  async getStorageMetrics(): Promise<number> {
    try {
      const res = await this.s3Client.send(new ListObjectsV2Command({ Bucket: this.bucketName }));
      return res.KeyCount || 0;
    } catch (error) {
      return 0;
    }
  }

  async listOrders(): Promise<Order[]> {
    try {
      const listRes = await this.s3Client.send(new ListObjectsV2Command({ Bucket: this.bucketName }));
      if (!listRes.Contents) return [];

      const ordersPromises = listRes.Contents.map(async (obj) => {
        try {
          const getRes = await this.s3Client.send(new GetObjectCommand({ Bucket: this.bucketName, Key: obj.Key! }));
          const bodyContent = await getRes.Body?.transformToString();
          return JSON.parse(bodyContent || '{}') as Order;
        } catch (e) {
          return {
            orderId: obj.Key?.replace('.json', '') || 'unknown',
            product: 'Error loading data',
            orderDate: obj.LastModified?.toISOString() || '',
            status: 'PROCESSED' as const
          };
        }
      });

      return Promise.all(ordersPromises);
    } catch (error) {
      console.error('Error listing orders from S3:', error);
      return [];
    }
  }
}
