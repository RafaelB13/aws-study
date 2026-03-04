import { CloudWatchLogsClient, CloudWatchLogsClientConfig, DescribeLogStreamsCommand, GetLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';
import { ILoggingGateway } from '@src/application/interfaces/Gateways';

export class CloudWatchGateway implements ILoggingGateway {
  private readonly cwClient: CloudWatchLogsClient;

  constructor(endpoint?: string) {
    const isLocal = !!process.env.LOCALSTACK_HOSTNAME || (endpoint && endpoint.includes('localhost'));
    const config: CloudWatchLogsClientConfig = { region: 'us-east-1' };
    
    if (isLocal && endpoint) {
      config.endpoint = endpoint;
      config.credentials = { accessKeyId: 'test', secretAccessKey: 'test' };
    }
    
    this.cwClient = new CloudWatchLogsClient(config);
  }

  async getRecentLogs(logGroupName: string, limit = 15): Promise<{ message: string; timestamp: string; stream: string }[]> {
    try {
      // 1. Get recent streams
      const streamsRes = await this.cwClient.send(new DescribeLogStreamsCommand({
        logGroupName,
        orderBy: 'LastEventTime',
        descending: true,
        limit: 1
      }));

      if (!streamsRes.logStreams || streamsRes.logStreams.length === 0) return [];

      const latestStream = streamsRes.logStreams[0].logStreamName;

      // 2. Get events from the latest stream
      const eventsRes = await this.cwClient.send(new GetLogEventsCommand({
        logGroupName,
        logStreamName: latestStream!,
        limit,
        startFromHead: false
      }));

      return (eventsRes.events || []).map(event => ({
        message: event.message?.trim() || '',
        timestamp: new Date(event.timestamp!).toISOString(),
        stream: latestStream!
      })).reverse(); // Most recent first
    } catch (error) {
      // Fallback: If log group doesn't exist yet (no executions)
      return [];
    }
  }
}
