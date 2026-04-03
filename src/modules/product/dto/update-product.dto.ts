export interface UpdateProductDto {
  name?: string;
  categoryId?: string;
  price?: number;
  content?: string;
  image?: string;
  discountRate?: number;
  discountStartTime?: string;
  discountEndTime?: string;
  isSoldOut?: boolean;
  stocks?: {
    sizeId: number;
    quantity: number;
  }[];
}
