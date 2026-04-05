import { Response } from 'express';
import { OrderService } from './order.service';
import { AuthRequest } from '../../common/types/auth';
import { validateCreateOrder } from './validators/order.validator';

const orderService = new OrderService();

export class OrderController {
  async getMyOrders(req: AuthRequest, res: Response): Promise<void> {
    const buyerId = req.user!.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await orderService.getMyOrders(buyerId, page, limit);

    res.status(200).json(result);
  }

  async getOrderById(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const orderId = req.params.orderId as string;

    const order = await orderService.getOrderById(userId, orderId);

    res.status(200).json(order);
  }

  async createOrder(req: AuthRequest, res: Response): Promise<void> {
    const buyerId = req.user!.userId;

    // ✅ 디버깅: 실제로 뭐가 들어오는지 확인!
    console.log('=== ORDER REQUEST BODY ===');
    console.log(JSON.stringify(req.body, null, 2));

    // phone → phoneNumber 매핑
    if (req.body.phone && !req.body.phoneNumber) {
      req.body.phoneNumber = req.body.phone;
    }

    // ✅ 디버깅: items 확인
    const items = req.body.orderItems || req.body.items;
    console.log('=== ITEMS ===');
    console.log(JSON.stringify(items, null, 2));

    validateCreateOrder(req.body);

    const order = await orderService.createOrder(buyerId, {
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      usePoint: req.body.usePoint || 0,
      items: req.body.orderItems || req.body.items,
    });

    res.status(201).json(order);
  }

  async updateOrder(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const orderId = req.params.orderId as string;

    const order = await orderService.updateOrder(userId, orderId, req.body);

    res.status(200).json(order);
  }

  async cancelOrder(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const orderId = req.params.orderId as string;

    const order = await orderService.cancelOrder(userId, orderId);

    res.status(200).json(order);
  }
}
