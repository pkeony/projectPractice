export interface OrderItemWithDetail {
  id: string;
  orderId: string;
  productId: string;
  sizeId: number;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: string;
    name: string;
    image: string | null;
    store: {
      id: string;
      name: string;
    };
  };
  size: {
    id: number;
    name: string;
    nameEn: string;
    nameKo: string;
  };
  review: {
    id: string;
  } | null;
}

export interface OrderWithDetail {
  id: string;
  buyerId: string;
  name: string;
  phoneNumber: string;
  address: string;
  subtotal: number;
  usePoint: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemWithDetail[];
  payment: {
    id: string;
    price: number;
    status: string;
    createdAt: Date;
  } | null;
}

export interface OrderSummary {
  id: string;
  name: string;
  subtotal: number;
  usePoint: number;
  status: string;
  createdAt: Date;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      image: string | null;
    };
    size: {
      id: number;
      name: string;
    };
  }[];
}
