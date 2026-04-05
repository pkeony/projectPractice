export interface InquiryUser {
  id: string;
  name: string;
  image: string | null;
}

export interface InquiryProduct {
  id: string;
  name: string;
  image: string | null;
  store: {
    id: string;
    name: string;
    userId: string;
  };
}

export interface InquiryReplyEntity {
  id: string;
  inquiryId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: InquiryUser;
}

export interface InquiryWithDetail {
  id: string;
  userId: string;
  productId: string;
  title: string;
  content: string;
  isSecret: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user: InquiryUser;
  product: InquiryProduct;
  reply: InquiryReplyEntity | null;
}

export interface InquirySummary {
  id: string;
  userId: string;
  title: string;
  isSecret: boolean;
  status: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
  };
  reply: {
    id: string;
  } | null;
}
