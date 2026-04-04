import { Router } from 'express';
import { OrderController } from './order.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authMiddleware } from '../../common/middlewares/auth';

const orderRouter = Router();
const orderController = new OrderController();

orderRouter.get(
  '/me',
  authMiddleware,
  asyncHandler(orderController.getMyOrders)
);

orderRouter.get(
  '/store',
  authMiddleware,
  asyncHandler(orderController.getStoreOrders)
);

orderRouter.get(
  '/:orderId',
  authMiddleware,
  asyncHandler(orderController.getOrderById)
);

orderRouter.post(
  '/',
  authMiddleware,
  asyncHandler(orderController.createOrder)
);

orderRouter.post(
  '/:orderId/pay',
  authMiddleware,
  asyncHandler(orderController.payOrder)
);

orderRouter.post(
  '/:orderId/cancel',
  authMiddleware,
  asyncHandler(orderController.cancelOrder)
);

export default orderRouter;
