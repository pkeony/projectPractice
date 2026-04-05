export interface CreateReviewDto {
  orderItemId: string;
  productId: string;
  rating: number;
  content: string;
}
