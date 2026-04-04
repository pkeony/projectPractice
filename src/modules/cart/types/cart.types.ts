export interface CartItemProduct {
  id: string;
  name: string;
  price: number;
  discountRate: number;
  image: string | null;
  isSoldOut: boolean;
  store: {
    id: string;
    name: string;
  };
}

export interface CartItemSize {
  id: number;
  name: string;
  nameEn: string;
  nameKo: string;
}

export interface CartItemEntity {
  id: string;
  cartId: string;
  productId: string;
  sizeId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: CartItemProduct;
  size: CartItemSize;
}

export interface CartWithItems {
  id: string;
  buyerId: string;
  createdAt: Date;
  updatedAt: Date;
  items: CartItemEntity[];
}

export interface CartResponse {
  cart: CartWithItems;
  totalPrice: number;
  totalDiscountedPrice: number;
  totalItems: number;
}
