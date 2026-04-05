import { DashboardRepository } from './dashboard.repository';
import { StoreRepository } from '../store/store.repository';
import {
  DashboardResponse,
  PeriodData,
  PeriodStats,
  TopSalesProduct,
  PriceRangeData,
} from './types/dashboard.types';
import { AppError } from '../../common/types/errors';

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
  async getDashboard(userId: string): Promise<DashboardResponse> {
    const store = await storeRepository.findByUserId(userId);

    if (!store) {
      throw new AppError(404, '등록된 가게가 없습니다.', 'Not Found');
    }

    const now = new Date();

    // Today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    // This week (Mon–Sun)
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    const weekEnd = new Date(todayEnd);

    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(weekEnd);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

    // This month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    // This year
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    const prevYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const prevYearEnd = new Date(
      now.getFullYear() - 1,
      11,
      31,
      23,
      59,
      59,
      999
    );

    const [
      todayOrders,
      yesterdayOrders,
      weekOrders,
      prevWeekOrders,
      monthOrders,
      prevMonthOrders,
      yearOrders,
      prevYearOrders,
    ] = await Promise.all([
      dashboardRepository.findCompletedOrders(store.id, todayStart, todayEnd),
      dashboardRepository.findCompletedOrders(
        store.id,
        yesterdayStart,
        yesterdayEnd
      ),
      dashboardRepository.findCompletedOrders(store.id, weekStart, weekEnd),
      dashboardRepository.findCompletedOrders(
        store.id,
        prevWeekStart,
        prevWeekEnd
      ),
      dashboardRepository.findCompletedOrders(store.id, monthStart, monthEnd),
      dashboardRepository.findCompletedOrders(
        store.id,
        prevMonthStart,
        prevMonthEnd
      ),
      dashboardRepository.findCompletedOrders(store.id, yearStart, yearEnd),
      dashboardRepository.findCompletedOrders(
        store.id,
        prevYearStart,
        prevYearEnd
      ),
    ]);

    return {
      today: this.buildPeriodData(todayOrders, yesterdayOrders),
      week: this.buildPeriodData(weekOrders, prevWeekOrders),
      month: this.buildPeriodData(monthOrders, prevMonthOrders),
      year: this.buildPeriodData(yearOrders, prevYearOrders),
      topSales: this.calculateTopSales(yearOrders),
      priceRange: this.calculatePriceRange(yearOrders),
    };
  }

  private calcStats(orders: any[]): PeriodStats {
    let totalSales = 0;
    for (const order of orders) {
      for (const item of order.items) {
        totalSales += item.price * item.quantity;
      }
    }
    return { totalOrders: orders.length, totalSales };
  }

  private calcChangeRate(
    current: PeriodStats,
    previous: PeriodStats
  ): PeriodStats {
    const ordersChange =
      previous.totalOrders > 0
        ? Math.round(
            ((current.totalOrders - previous.totalOrders) /
              previous.totalOrders) *
              100
          )
        : current.totalOrders > 0
          ? 100
          : 0;

    const salesChange =
      previous.totalSales > 0
        ? Math.round(
            ((current.totalSales - previous.totalSales) /
              previous.totalSales) *
              100
          )
        : current.totalSales > 0
          ? 100
          : 0;

    return { totalOrders: ordersChange, totalSales: salesChange };
  }

  private buildPeriodData(
    currentOrders: any[],
    previousOrders: any[]
  ): PeriodData {
    const current = this.calcStats(currentOrders);
    const previous = this.calcStats(previousOrders);
    const changeRate = this.calcChangeRate(current, previous);

    return {
      current,
      previous,
      changeRate,
    };
  }

  private calculateTopSales(orders: any[]): TopSalesProduct[] {
    const productMap = new Map<
      string,
      { totalOrders: number; product: { id: string; name: string; price: number } }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        const key = item.product.id;
        const existing = productMap.get(key);

        if (existing) {
          existing.totalOrders += item.quantity;
        } else {
          productMap.set(key, {
            totalOrders: item.quantity,
            product: {
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
            },
          });
        }
      }
    }

    return Array.from(productMap.values())
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 5);
  }

  private calculatePriceRange(orders: any[]): PriceRangeData[] {
    const rangeData = PRICE_RANGES.map((range) => ({
      ...range,
      totalSales: 0,
    }));

    let grandTotal = 0;

    for (const order of orders) {
      for (const item of order.items) {
        const itemRevenue = item.price * item.quantity;
        const unitPrice = item.product.price;

        grandTotal += itemRevenue;

        for (const rangeItem of rangeData) {
          if (unitPrice >= rangeItem.min && unitPrice < rangeItem.max) {
            rangeItem.totalSales += itemRevenue;
            break;
          }
        }
      }
    }

    return rangeData.map((item) => ({
      priceRange: item.range,
      totalSales: item.totalSales,
      percentage:
        grandTotal > 0
          ? Math.round((item.totalSales / grandTotal) * 1000) / 10
          : 0,
    }));
  }
}
