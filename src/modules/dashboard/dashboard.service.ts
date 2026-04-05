import { DashboardRepository } from './dashboard.repository';
import { StoreRepository } from '../store/store.repository';
import {
  DashboardResponse,
  SalesSummary,
  DailySales,
  TopProduct,
  PriceRangeRevenue,
} from './types/dashboard.types';
import { AppError } from '../../common/types/errors';
import { number } from 'superstruct';

const dashboardRepository = new DashboardRepository();
const storeRepository = new StoreRepository();

const PRICE_RANGES = [
  { range: '0 ~ 50,000원', min: 0, max: 50000 },
  { range: '50,000 ~ 100,000원', min: 50000, max: 100000 },
  { range: '100,000 ~ 200,000원', min: 100000, max: 200000 },
  { range: '200,000 ~ 500,000원', min: 200000, max: 500000 },
  { range: '500,000원 이상', min: 500000, max: Infinity },
];

export class DashboardService {
  async getDashboard(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<DashboardResponse> {
    const store = await storeRepository.findByUserId(userId);

    if (!store) {
      throw new AppError(404, '등록된 가게가 없습니다.', 'Not Found');
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AppError(
        400,
        '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)',
        'Bad Request'
      );
    }

    if (start > end) {
      throw new AppError(
        400,
        '시작일이 종료일보다 클 수 없습니다.',
        'Bad Request'
      );
    }

    const orders = await dashboardRepository.findCompletedOrders(
      store.id,
      start,
      end
    );

    const summary = this.calculateSummary(orders);
    const dailySales = this.calculateDailySales(orders, start, end);
    const topProducts = this.calculateTopProducts(orders);
    const priceRangeRevenue = this.calculatePriceRangeRevenue(orders);

    return {
      summary,
      dailySales,
      topProducts,
      priceRangeRevenue,
      dateRange: { startDate, endDate },
    };
  }

  //판매 요약(총 주문 수, 총 매출, 총 판매 수량, 평균 주문 금액)

  private calculateSummary(orders: any[]): SalesSummary {
    let totalRevenue = 0;
    let totalItemsSold = 0;

    for (const order of orders) {
      for (const item of order.items) {
        totalRevenue += item.price * item.quantity;
        totalItemsSold += item.quantity;
      }
    }

    return {
      totalOrders: orders.length,
      totalRevenue,
      totalItemsSold,
      averageOrderValue:
        orders.length > 0 ? Math.floor(totalRevenue / orders.length) : 0,
    };
  }

  //일별 판매 (기간 내 매일의 주문 수 + 매출)
  private calculateDailySales(
    orders: any[],
    startDate: Date,
    endDate: Date
  ): DailySales[] {
    //날짜 별 Map 초기화 (빈 날짜도 0으로!)
    const dailyMap = new Map<string, { orders: number; revenue: number }>();

    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0]; // "2026-04-01"
      dailyMap.set(dateStr, { orders: 0, revenue: 0 });
      current.setDate(current.getDate() + 1); // 다음날로
    }

    //주문 데이터 집계
    for (const order of orders) {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      const daily = dailyMap.get(dateStr);

      if (daily) {
        daily.orders += 1;
        for (const item of order.items) {
          daily.revenue += item.price * item.quantity;
        }
      }
    }

    // Map -> 배열 변환
    const result: DailySales[] = [];
    for (const [date, data] of dailyMap) {
      result.push({ date, ...data });
    }

    return result;
  }

  //많이 판매된 상품 TOP5
  private calculateTopProducts(orders: any[]): TopProduct[] {
    const productMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        productImage: string | null;
        totalQuantity: number;
        totalRevenue: number;
      }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        const key = item.product.id;
        const existing = productMap.get(key);

        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.totalRevenue += item.quantity * item.price;
        } else {
          productMap.set(key, {
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.image,
            totalQuantity: item.quantity,
            totalRevenue: item.price * item.quantity,
          });
        }
      }
    }
    //수량 많은 순 정렬 -> 상위 5개
    const sorted = Array.from(productMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity) // 수량 많은순
      .slice(0, 5); // 상위 5개

    return sorted.map((product, index) => ({
      rank: index + 1,
      ...product,
    }));
  }

  //가격대별 매충 비중
  private calculatePriceRangeRevenue(orders: any[]): PriceRangeRevenue[] {
    //가격대 별 초기화
    const rangeData = PRICE_RANGES.map((range) => ({
      ...range,
      orderCount: 0,
      revenue: 0,
    }));

    let grandTotal = 0;

    for (const order of orders) {
      for (const item of order.items) {
        const itemRevenue = item.price * item.quantity;
        const unitPrice = item.product.price;

        grandTotal += itemRevenue;

        //어떤 가격대에 속하는지 찾기
        for (const rangeItem of rangeData) {
          if (unitPrice >= rangeItem.min && unitPrice < rangeItem.max) {
            rangeItem.orderCount += 1;
            rangeItem.revenue += itemRevenue;
            break;
          }
        }
      }
    }

    //비중(%) 계산
    return rangeData.map((item) => ({
      range: item.range,
      minPrice: item.min,
      maxPrice: item.max === Infinity ? -1 : item.max,
      orderCount: item.orderCount,
      revenue: item.revenue,
      percentage:
        grandTotal > 0
          ? Math.round((item.revenue / grandTotal) * 1000) / 10
          : 0,
    }));
  }
}
