import { ProcessOrderUseCase } from '@src/application/use-cases/AppUseCases';
import { S3Gateway } from '@src/infrastructure/aws/S3Gateway';
import { SQSEvent, SQSHandler } from 'aws-lambda';

const endpoint = process.env.LOCALSTACK_HOSTNAME 
  ? `http://${process.env.LOCALSTACK_HOSTNAME}:4566` 
  : 'http://localhost.localstack.cloud:4566';

const s3Gateway = new S3Gateway(endpoint);
const processOrderUseCase = new ProcessOrderUseCase(s3Gateway);

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  console.log(`🎯 Consumer Woke Up! Received ${event.Records.length} messages.`);

  for (const record of event.Records) {
    try {
      const payload = JSON.parse(record.body);
      await processOrderUseCase.execute(payload);
      console.log(`✅ Order Receipt for ${payload.orderId} successfully saved to S3!`);
    } catch (error) {
      console.error(`❌ Failed to process SQS message ID: ${record.messageId}`, error);
      throw error;
    }
  }
};
