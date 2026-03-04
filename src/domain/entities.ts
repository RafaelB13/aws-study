export interface Order {
  orderId: string;
  product: string;
  orderDate: string;
}

export interface SystemStats {
  sqsCount: number;
  s3Count: number;
}
