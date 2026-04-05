import { OrderRepository } from './order.repository';
import { StoreRepository } from '../store/store.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginatedResult } from '../../common/types/pagination';
import { AppError } from '../../common/types/errors';
import prisma from '../../common/database/prisma';

const orderRepository = new OrderRepository();
const storeRepository = new StoreRepository();

function transformOrderItems(items: any[]) {
  return items.map((item: any) => ({
    id: item.id,
    price: item.price,
    quantity: item.quantity,
    isReviewed: !!item.review,
    productId: item.productId,
    product: item.product
      ? {
          name: item.product.name,
          image: item.product.image,
          reviews: item.product.reviews ?? [],
        }
      : undefined,
    size: item.size
      ? {
          id: item.size.id,
          name: item.size.name,
          size: { en: item.size.nameEn, ko: item.size.nameKo },
        }
      : undefined,
  }));
}

function transformOrder(order: any) {
  return {
    id: order.id,
    name: order.name,
    address: order.address,
    phoneNumber: order.phoneNumber,
    subtotal: order.subtotal,
    totalQuantity: order.items
      ? order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
      : 0,
    usePoint: order.usePoint,
    createdAt: order.createdAt,
    orderItems: order.items ? transformOrderItems(order.items) : [],
    payments: order.payment ?? null,
  };
}

export class OrderService {
  async getMyOrders(
    buyerId: string,
    page: number,
    limit: number
  ): Promise<any> {
    const { orders, total } = await orderRepository.findByBuyerId(
      buyerId,
      page,
      limit
    );

    // ✅ 프론트 OrdersResponse 형태로 반환!
    return {
      data: orders.map(transformOrder),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(userId: string, orderId: string): Promise<any> {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new AppError(404, '주문을 찾을 수 없습니다.', 'Not Found');
    }

    if (order.buyerId !== userId) {
      const store = await storeRepository.findByUserId(userId);
      const isStoreOwner = order.items.some(
        (item) => (item.product as any).store?.id === store?.id
      );

      if (!isStoreOwner) {
        throw new AppError(403, '주문을 조회할 권한이 없습니다.', 'Forbidden');
      }
    }

    return transformOrder(order);
  }

  async createOrder(
    buyerId: string,
    createOrderDto: CreateOrderDto
  ): Promise<any> {
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
      const sizeId = Number(item.sizeId);
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
            sizeId,
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
        sizeId,
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

      // ✅ 결제 생성 + 주문 상태 변경
      const paymentPrice = subtotal - createOrderDto.usePoint;
      await tx.payment.create({
        data: {
          orderId: createdOrder.id,
          price: paymentPrice,
          status: 'Paid',
        },
      });

      await tx.order.update({
        where: { id: createdOrder.id },
        data: { status: 'CompletedPayment' },
      });

      return createdOrder;
    });

    // 최신 상태로 다시 조회
    const completedOrder = await orderRepository.findById(order.id);
    return transformOrder(completedOrder);
  }

  async updateOrder(
    userId: string,
    orderId: string,
    data: { name?: string; address?: string; phoneNumber?: string }
  ): Promise<any> {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new AppError(404, '주문을 찾을 수 없습니다.', 'Not Found');
    }

    if (order.buyerId !== userId) {
      throw new AppError(403, '본인의 주문만 수정할 수 있습니다.', 'Forbidden');
    }

    const updatedOrder = await orderRepository.updateOrder(orderId, data);
    return transformOrder(updatedOrder);
  }

  async cancelOrder(userId: string, orderId: string): Promise<any> {
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

    return transformOrder(updatedOrder);
  }
}
