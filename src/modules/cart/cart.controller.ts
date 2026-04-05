import { Response } from 'express';
import { CartService } from './cart.service';
import { AuthRequest } from '../../common/types/auth';
import {
  validateAddCartItem,
  validateUpdateCartItem,
} from './validators/cart.validator';

const cartService = new CartService();

function transformCartSize(size: any) {
  if (!size) return size;
  return {
    id: size.id,
    name: size.name,
    size: { en: size.nameEn, ko: size.nameKo },
  };
}

function transformItem(item: any) {
  return {
    ...item,
    size: transformCartSize(item.size),
    product: {
      ...item.product,
      stocks: item.product.stocks
        ? item.product.stocks.map((s: any) => ({
            ...s,
            size: transformCartSize(s.size),
          }))
        : [],
    },
  };
}

// GET /cart → Cart 전체
function transformCartToFrontend(result: any) {
  const cart = result.cart;
  return {
    id: cart.id,
    buyerId: cart.buyerId,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
    items: cart.items.map((item: any) => transformItem(item)),
  };
}

// PATCH /cart → CartItem[] 만
function transformCartItems(result: any): any[] {
  return result.cart.items.map((item: any) => transformItem(item));
}

export class CartController {
  async getMyCart(req: AuthRequest, res: Response): Promise<void> {
    const buyerId = req.user!.userId;
    const result = await cartService.getMyCart(buyerId);
    res.status(200).json(transformCartToFrontend(result));
  }

  async updateCart(req: AuthRequest, res: Response): Promise<void> {
    const buyerId = req.user!.userId;

    if (!req.body || (!req.body.productId && !req.body.sizes)) {
      const result = await cartService.getMyCart(buyerId);
      res.status(200).json(transformCartToFrontend(result));
      return;
    }

    const { productId, sizes } = req.body;

    if (!productId || !sizes || !Array.isArray(sizes)) {
      validateAddCartItem(req.body);
      const result = await cartService.addCartItem(buyerId, {
        productId: req.body.productId,
        sizeId: req.body.sizeId,
        quantity: req.body.quantity,
      });
      res.status(200).json(transformCartItems(result));
      return;
    }

    let lastResult: any;
    for (const sizeEntry of sizes) {
      lastResult = await cartService.addCartItem(buyerId, {
        productId,
        sizeId: sizeEntry.sizeId,
        quantity: sizeEntry.quantity,
      });
    }

    res.status(200).json(transformCartItems(lastResult));
  }

  async addCartItem(req: AuthRequest, res: Response): Promise<void> {
    const buyerId = req.user!.userId;
    validateAddCartItem(req.body);
    const result = await cartService.addCartItem(buyerId, {
      productId: req.body.productId,
      sizeId: req.body.sizeId,
      quantity: req.body.quantity,
    });
    res.status(201).json(transformCartToFrontend(result));
  }

  async updateCartItem(req: AuthRequest, res: Response): Promise<void> {
    const buyerId = req.user!.userId;
    const cartItemId = req.params.cartItemId as string;
    validateUpdateCartItem(req.body);
    const result = await cartService.updateCartItem(buyerId, cartItemId, {
      quantity: req.body.quantity,
    });
    res.status(200).json(transformCartToFrontend(result));
  }

  async deleteCartItem(req: AuthRequest, res: Response): Promise<void> {
    const buyerId = req.user!.userId;
    const cartItemId = req.params.cartItemId as string;
    const result = await cartService.deleteCartItem(buyerId, cartItemId);
    res.status(200).json(transformCartToFrontend(result));
  }

  async getCartItem(req: AuthRequest, res: Response): Promise<void> {
    const buyerId = req.user!.userId;
    const cartItemId = req.params.cartItemId as string;
    const result = await cartService.getMyCart(buyerId);
    const item = result.cart.items.find((i: any) => i.id === cartItemId);

    if (!item) {
      res.status(404).json({ message: '장바구니 아이템을 찾을 수 없습니다.' });
      return;
    }

    res.status(200).json(transformItem(item));
  }
}
