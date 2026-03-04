import { CreateOrderUseCase, GetSystemStatusUseCase } from '@src/application/use-cases/AppUseCases';
import { S3Gateway } from '@src/infrastructure/aws/S3Gateway';
import { SQSGateway } from '@src/infrastructure/aws/SQSGateway';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const endpoint = process.env.LOCALSTACK_HOSTNAME 
  ? `http://${process.env.LOCALSTACK_HOSTNAME}:4566` 
  : 'http://localhost.localstack.cloud:4566';

const sqsGateway = new SQSGateway(endpoint);
const s3Gateway = new S3Gateway(endpoint);

const createOrderUseCase = new CreateOrderUseCase(sqsGateway);
const getStatusUseCase = new GetSystemStatusUseCase(sqsGateway, s3Gateway);

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'GET') {
    try {
      const stats = await getStatusUseCase.execute();
      return buildResponse(200, stats);
    } catch (error) {
      return buildResponse(500, { error: "Failed to fetch dashboard metrics" });
    }
  }

  try {
    const order = await createOrderUseCase.execute();
    return buildResponse(202, {
      message: 'Order Received! Your purchase has been added to the processing queue.',
      order: order,
    });
  } catch (error) {
    return buildResponse(500, {
      message: 'Internal server error: Failed to dispatch message to SQS.',
    });
  }
};

const buildResponse = (statusCode: number, body: any): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  };
};
