export interface Order {
  orderId: string;
  product: string;
  orderDate: string;
  status?: 'PENDING' | 'PROCESSED';
  processedAt?: string;
}

export interface SystemStats {
  sqs: {
    visible: number;
    inFlight: number;
    delayed: number;
  };
  s3Count: number;
  orders: Order[];
  logs: {
    message: string;
    timestamp: string;
    stream?: string;
  }[];
}
