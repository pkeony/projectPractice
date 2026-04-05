export interface UserSummary {
  id: string;
  name: string;
  image: string | null;
}

export interface ProductSummary {
  id: string;
  name: string;
  image: string | null;
}

export interface ReviewEntity {
  id: string;
  userId: string;
  productId: string;
  orderItemId: string;
  rating: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewWithUser extends ReviewEntity {
  user: UserSummary;
}

export interface ReviewWithDetail extends ReviewEntity {
  user: UserSummary;
  product: ProductSummary;
}
