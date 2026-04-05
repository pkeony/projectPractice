import prisma from '../../common/database/prisma';

export class DashboardRepository {
  //기간 내 내 가게 완료된 주문 조회
  async findCompletedOrders(storeId: string, startDate: Date, endDate: Date) {
    return prisma.order.findMany({
      where: {
        status: 'CompletedPayment',
        createdAt: {
          gte: startDate,
          lte: endDate, //gte/lte 날짜 범위 필터
        },
        items: {
          some: {
            product: { storeId }, // 내 가게 상품만!
          },
        },
      },
      include: {
        items: {
          where: {
            product: { storeId }, // 주문안의 상품중 내 가게것만 가져옴
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
              },
            },
          },
        },
      },

      orderBy: { createdAt: 'asc' },
    });
  }
}
