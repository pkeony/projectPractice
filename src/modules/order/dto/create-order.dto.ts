export interface CreateOrderDto {
  name: string;
  phoneNumber: string;
  address: string;
  usePoint: number;
  items: {
    productId: string;
    sizeId: number;
    quantity: number;
  }[];
}
