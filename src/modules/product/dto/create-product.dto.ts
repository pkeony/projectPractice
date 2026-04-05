export interface CreateProductDto {
  name: string;
  categoryId: string;
  price: number;
  content?: string;
  image?: string;
  discountRate?: number;
  discountStartTime?: string;
  discountEndTime?: string;
  stocks?: {
    sizeId: number;
    quantity: number;
  }[];
}
