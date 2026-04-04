import { Router } from 'express';
import { CartController } from './cart.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authMiddleware } from '../../common/middlewares/auth';

const cartRouter = Router();
const cartController = new CartController();

cartRouter.get('/', authMiddleware, asyncHandler(cartController.getMyCart));

cartRouter.post(
  '/items',
  authMiddleware,
  asyncHandler(cartController.addCartItem)
);

cartRouter.patch(
  '/items/:cartItemId',
  authMiddleware,
  asyncHandler(cartController.updateCartItem)
);

cartRouter.delete(
  '/items/:cartItemId',
  authMiddleware,
  asyncHandler(cartController.deleteCartItem)
);

export default cartRouter;
