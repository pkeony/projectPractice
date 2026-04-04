import { Response } from 'express';
import { CartService } from './cart.service';
import { AuthRequest } from '../../common/types/auth';
import {
  validateAddCartItem,
  validateUpdateCartItem,
} from './validators/cart.validator';

const cartService = new CartService();

export class CartController {
  async getMyCart(req: AuthRequest, res: Response): Promise<void> {
    const buyerId = req.user!.userId;

    const result = await cartService.getMyCart(buyerId);

    res.status(200).json(result);
  }

  async addCartItem(req: AuthRequest, res: Response): Promise<void> {
    const buyerId = req.user!.userId;

    validateAddCartItem(req.body);

    const result = await cartService.addCartItem(buyerId, {
      productId: req.body.productId,
      sizeId: req.body.sizeId,
      quantity: req.body.quantity,
    });

    res.status(201).json(result);
  }

  async updateCartItem(req: AuthRequest, res: Response): Promise<void> {
    const buyerId = req.user!.userId;
    const cartItemId = req.params.cartItemId as string;

    validateUpdateCartItem(req.body);

    const result = await cartService.updateCartItem(buyerId, cartItemId, {
      quantity: req.body.quantity,
    });

    res.status(200).json(result);
  }

  async deleteCartItem(req: AuthRequest, res: Response): Promise<void> {
    const buyerId = req.user!.userId;
    const cartItemId = req.params.cartItemId as string;

    const result = await cartService.deleteCartItem(buyerId, cartItemId);

    res.status(200).json(result);
  }
}
