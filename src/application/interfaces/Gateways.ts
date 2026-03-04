import { Order } from '@src/domain/entities';

export interface IQueueGateway {
  sendToQueue(order: Order): Promise<void>;
  getQueueMetrics(): Promise<{ visible: number; inFlight: number; delayed: number; }>;
}

export interface IStorageGateway {
  saveOrder(order: Order): Promise<void>;
  getStorageMetrics(): Promise<{ count: number; totalSize: number }>;
  listOrders(): Promise<Order[]>;
}

export interface ILoggingGateway {
  getRecentLogs(logGroupName: string, limit?: number): Promise<{ message: string; timestamp: string; stream: string }[]>;
}
