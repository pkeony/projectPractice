import { Router } from 'express';
import { CartController } from './cart.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authMiddleware } from '../../common/middlewares/auth';

const cartRouter = Router();
const cartController = new CartController();

cartRouter.get('/', authMiddleware, asyncHandler(cartController.getMyCart));

cartRouter.post(
  '/',
  authMiddleware,
  asyncHandler(cartController.updateCart)
);

cartRouter.patch(
  '/',
  authMiddleware,
  asyncHandler(cartController.updateCart)
);

cartRouter.delete(
  '/:cartItemId',
  authMiddleware,
  asyncHandler(cartController.deleteCartItem)
);

cartRouter.get(
  '/:cartItemId',
  authMiddleware,
  asyncHandler(cartController.getCartItem)
);

export default cartRouter;
