import { Router } from 'express';
import { OrderController } from './order.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authMiddleware } from '../../common/middlewares/auth';

const orderRouter = Router();
const orderController = new OrderController();

orderRouter.get(
  '/',
  authMiddleware,
  asyncHandler(orderController.getMyOrders)
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

orderRouter.patch(
  '/:orderId',
  authMiddleware,
  asyncHandler(orderController.updateOrder)
);

orderRouter.delete(
  '/:orderId',
  authMiddleware,
  asyncHandler(orderController.cancelOrder)
);

export default orderRouter;
