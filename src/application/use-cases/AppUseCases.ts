import { IQueueGateway, IStorageGateway } from '@src/application/interfaces/Gateways';
import { Order, SystemStats } from '@src/domain/entities';

export class CreateOrderUseCase {
  constructor(private readonly queueGateway: IQueueGateway) {}

  async execute(): Promise<Order> {
    const orderNumber = Math.floor(Math.random() * 100000);
    const products = ["Laptop", "Gaming Mouse", "Ergonomic Chair", "Mechanical Keyboard"];
    const product = products[Math.floor(Math.random() * products.length)];

    const order: Order = {
      orderId: `ORD-${orderNumber}`,
      product: product,
      orderDate: new Date().toISOString()
    };

    await this.queueGateway.sendToQueue(order);
    return order;
  }
}

export class ProcessOrderUseCase {
  constructor(private readonly storageGateway: IStorageGateway) {}

  async execute(order: Order): Promise<void> {
    await this.storageGateway.saveOrder(order);
  }
}

export class GetSystemStatusUseCase {
  constructor(
    private readonly queueGateway: IQueueGateway,
    private readonly storageGateway: IStorageGateway
  ) {}

  async execute(): Promise<SystemStats> {
    const [sqsCount, s3Count, orders] = await Promise.all([
      this.queueGateway.getQueueMetrics(),
      this.storageGateway.getStorageMetrics(),
      this.storageGateway.listOrders()
    ]);

    return { sqsCount, s3Count, orders };
  }
}
