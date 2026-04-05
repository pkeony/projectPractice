export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface SalesSummary {
  totalOrders: number;
  totalRevenue: number;
  totalItemsSold: number;
  averageOrderValue: number;
}

export interface DailySales {
  date: string;
  orders: number;
  revenue: number;
}

export interface TopProduct {
  rank: number;
  productId: string;
  productName: string;
  productImage: string | null;
  totalQuantity: number;
  totalRevenue: number;
}

export interface PriceRangeRevenue {
  range: string;
  minPrice: number;
  maxPrice: number;
  orderCount: number;
  revenue: number;
  percentage: number;
}

export interface DashboardResponse {
  summary: SalesSummary;
  dailySales: DailySales[];
  topProducts: TopProduct[];
  priceRangeRevenue: PriceRangeRevenue[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}
