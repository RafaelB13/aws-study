export interface Order {
  orderId: string;
  product: string;
  orderDate: string;
  status?: 'PENDING' | 'PROCESSED';
  processedAt?: string;
}

export interface SystemStats {
  sqsCount: number;
  s3Count: number;
  orders: Order[];
}
