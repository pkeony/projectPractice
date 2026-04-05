export interface PeriodStats {
  totalOrders: number;
  totalSales: number;
}

export interface PeriodData {
  current: PeriodStats;
  previous: PeriodStats | null;
  changeRate: PeriodStats;
}

export interface TopSalesProduct {
  totalOrders: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
}

export interface PriceRangeData {
  priceRange: string;
  totalSales: number;
  percentage: number;
}

export interface DashboardResponse {
  today: PeriodData;
  week: PeriodData;
  month: PeriodData;
  year: PeriodData;
  topSales: TopSalesProduct[];
  priceRange: PriceRangeData[];
}
