import { ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { IStorageGateway } from '../../application/interfaces/Gateways';
import { Order } from '../../domain/entities';

export class S3Gateway implements IStorageGateway {
  private readonly s3Client: S3Client;
  private readonly bucketName = 'meu-bucket-arquivos';

  constructor(endpoint: string) {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
    });
  }

  async saveOrder(order: Order): Promise<void> {
    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `${order.orderId}.json`,
      Body: JSON.stringify(order, null, 2),
      ContentType: 'application/json',
    }));
  }

  async getStorageMetrics(): Promise<number> {
    const res = await this.s3Client.send(new ListObjectsV2Command({ Bucket: this.bucketName }));
    return res.KeyCount || 0;
  }
}
