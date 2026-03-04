import { Order, SystemStats } from '@src/domain/entities';

export interface IQueueGateway {
  sendToQueue(order: Order): Promise<void>;
  getQueueMetrics(): Promise<number>;
}

export interface IStorageGateway {
  saveOrder(order: Order): Promise<void>;
  getStorageMetrics(): Promise<number>;
}

export interface IMonitoringGateway {
  getSystemStatus(): Promise<SystemStats>;
}
