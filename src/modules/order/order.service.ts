import { OrderRepository } from './order.repository';
import { StoreRepository } from '../store/store.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderWithDetail } from './types/order.types';
import { PaginatedResult } from '../../common/types/pagination';
import { AppError } from '../../common/types/errors';
import prisma from '../../common/database/prisma';

const orderRepository = new OrderRepository();
const storeRepository = new StoreRepository();

export class OrderService {
  async getMyOrders(
    buyerId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResult<any>> {
    const { orders, total } = await orderRepository.findByBuyerId(
      buyerId,
      page,
      limit
    );

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStoreOrders(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResult<any>> {
    const store = await storeRepository.findByUserId(userId);

    if (!store) {
      throw new AppError(404, '등록된 가게가 없습니다.', 'Not Found');
    }

    const { orders, total } = await orderRepository.findByStoreId(
      store.id,
      page,
      limit
    );

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrderById(
    userId: string,
    orderId: string
  ): Promise<OrderWithDetail> {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new AppError(404, '주문을 찾을 수 없습니다.', 'Not Found');
    }

    if (order.buyerId !== userId) {
      const store = await storeRepository.findByUserId(userId);
      const isStoreOwner = order.items.some(
        (item) => item.product.store.id === store?.id
      );

      if (!isStoreOwner) {
        throw new AppError(403, '주문을 조회할 권한이 없습니다.', 'Forbidden');
      }
    }

    return order;
  }

  async createOrder(
    buyerId: string,
    createOrderDto: CreateOrderDto
  ): Promise<OrderWithDetail> {
    const buyer = await prisma.user.findUnique({
      where: { id: buyerId },
    });

    if (!buyer) {
      throw new AppError(404, '유저를 찾을 수 없습니다.', 'Not Found');
    }

    if (createOrderDto.usePoint > buyer.points) {
      throw new AppError(400, '포인트가 부족합니다.', 'Bad Request');
    }

    let subtotal = 0;
    const orderItems: {
      productId: string;
      sizeId: number;
      quantity: number;
      price: number;
    }[] = [];

    for (const item of createOrderDto.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new AppError(
          404,
          `상품을 찾을 수 없습니다: ${item.productId}`,
          'Not Found'
        );
      }

      if (product.isSoldOut) {
        throw new AppError(
          400,
          `품절된 상품입니다: ${product.name}`,
          'Bad Request'
        );
      }

      const stock = await prisma.productStock.findUnique({
        where: {
          productId_sizeId: {
            productId: item.productId,
            sizeId: item.sizeId,
          },
        },
      });

      if (!stock || stock.quantity < item.quantity) {
        throw new AppError(
          400,
          `재고가 부족합니다: ${product.name}`,
          'Bad Request'
        );
      }

      const discountedPrice = Math.floor(
        product.price * (1 - product.discountRate / 100)
      );
      const itemTotal = discountedPrice * item.quantity;

      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        sizeId: item.sizeId,
        quantity: item.quantity,
        price: discountedPrice,
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await orderRepository.create({
        buyerId,
        name: createOrderDto.name,
        phoneNumber: createOrderDto.phoneNumber,
        address: createOrderDto.address,
        subtotal,
        usePoint: createOrderDto.usePoint,
        items: orderItems,
      });

      for (const item of orderItems) {
        await tx.productStock.update({
          where: {
            productId_sizeId: {
              productId: item.productId,
              sizeId: item.sizeId,
            },
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });
      }

      if (createOrderDto.usePoint > 0) {
        await tx.user.update({
          where: { id: buyerId },
          data: {
            points: { decrement: createOrderDto.usePoint },
          },
        });
      }

      return createdOrder;
    });

    return order;
  }

  async payOrder(userId: string, orderId: string): Promise<OrderWithDetail> {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new AppError(404, '주문을 찾을 수 없습니다.', 'Not Found');
    }

    if (order.buyerId !== userId) {
      throw new AppError(403, '본인의 주문만 결제할 수 있습니다.', 'Forbidden');
    }

    if (order.status !== 'WaitingPayment') {
      throw new AppError(
        400,
        '결제 대기 중인 주문만 결제할 수 있습니다.',
        'Bad Request'
      );
    }

    const paymentPrice = order.subtotal - order.usePoint;

    await orderRepository.createPayment(orderId, paymentPrice);
    const updatedOrder = await orderRepository.updateStatus(
      orderId,
      'CompletedPayment'
    );

    await prisma.user.update({
      where: { id: userId },
      data: {
        lifetimeSpend: { increment: paymentPrice },
      },
    });

    return updatedOrder;
  }

  async cancelOrder(userId: string, orderId: string): Promise<OrderWithDetail> {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new AppError(404, '주문을 찾을 수 없습니다.', 'Not Found');
    }

    if (order.buyerId !== userId) {
      throw new AppError(403, '본인의 주문만 취소할 수 있습니다.', 'Forbidden');
    }

    if (order.status === 'Canceled') {
      throw new AppError(400, '이미 취소된 주문입니다.', 'Bad Request');
    }

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.productStock.update({
          where: {
            productId_sizeId: {
              productId: item.productId,
              sizeId: item.sizeId,
            },
          },
          data: {
            quantity: { increment: item.quantity },
          },
        });
      }

      if (order.usePoint > 0) {
        await tx.user.update({
          where: { id: userId },
          data: {
            points: { increment: order.usePoint },
          },
        });
      }

      if (order.status === 'CompletedPayment') {
        await orderRepository.cancelPayment(orderId);

        const paymentPrice = order.subtotal - order.usePoint;
        await tx.user.update({
          where: { id: userId },
          data: {
            lifetimeSpend: { decrement: paymentPrice },
          },
        });
      }
    });

    const updatedOrder = await orderRepository.updateStatus(
      orderId,
      'Canceled'
    );

    return updatedOrder;
  }
}
