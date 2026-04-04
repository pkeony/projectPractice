import prisma from '../../common/database/prisma';
import { OrderWithDetail, OrderSummary } from './types/order.types';

const orderDetailInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          image: true,
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      size: true,
      review: {
        select: { id: true },
      },
    },
  },
  payment: true,
};

const orderSummaryInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      size: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
};

export class OrderRepository {
  async findById(orderId: string): Promise<OrderWithDetail | null> {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: orderDetailInclude,
    }) as Promise<OrderWithDetail | null>;
  }

  async findByBuyerId(
    buyerId: string,
    page: number,
    limit: number
  ): Promise<{ orders: OrderSummary[]; total: number }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { buyerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: orderSummaryInclude,
      }),
      prisma.order.count({ where: { buyerId } }),
    ]);

    return { orders: orders as OrderSummary[], total };
  }

  async findByStoreId(
    storeId: string,
    page: number,
    limit: number
  ): Promise<{ orders: OrderSummary[]; total: number }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          items: {
            some: {
              product: { storeId },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: orderSummaryInclude,
      }),
      prisma.order.count({
        where: {
          items: {
            some: {
              product: { storeId },
            },
          },
        },
      }),
    ]);

    return { orders: orders as OrderSummary[], total };
  }

  async create(data: {
    buyerId: string;
    name: string;
    phoneNumber: string;
    address: string;
    subtotal: number;
    usePoint: number;
    items: {
      productId: string;
      sizeId: number;
      quantity: number;
      price: number;
    }[];
  }): Promise<OrderWithDetail> {
    return prisma.order.create({
      data: {
        buyerId: data.buyerId,
        name: data.name,
        phoneNumber: data.phoneNumber,
        address: data.address,
        subtotal: data.subtotal,
        usePoint: data.usePoint,
        items: {
          create: data.items,
        },
      },
      include: orderDetailInclude,
    }) as Promise<OrderWithDetail>;
  }

  async updateStatus(
    orderId: string,
    status: string
  ): Promise<OrderWithDetail> {
    return prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
      include: orderDetailInclude,
    }) as Promise<OrderWithDetail>;
  }

  async createPayment(orderId: string, price: number): Promise<void> {
    await prisma.payment.create({
      data: {
        orderId,
        price,
        status: 'Paid',
      },
    });
  }

  async cancelPayment(orderId: string): Promise<void> {
    await prisma.payment.updateMany({
      where: { orderId },
      data: { status: 'Canceled' },
    });
  }
}
