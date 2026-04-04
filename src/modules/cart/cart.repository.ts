import prisma from '../../common/database/prisma';
import { CartWithItems, CartItemEntity } from './types/cart.types';

const cartItemInclude = {
  product: {
    select: {
      id: true,
      name: true,
      price: true,
      discountRate: true,
      image: true,
      isSoldOut: true,
      store: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  size: true,
};

export class CartRepository {
  async findByBuyerId(buyerId: string): Promise<CartWithItems | null> {
    return prisma.cart.findUnique({
      where: { buyerId },
      include: {
        items: {
          include: cartItemInclude,
          orderBy: { createdAt: 'desc' },
        },
      },
    }) as Promise<CartWithItems | null>;
  }

  async createCart(buyerId: string): Promise<CartWithItems> {
    return prisma.cart.create({
      data: { buyerId },
      include: {
        items: {
          include: cartItemInclude,
        },
      },
    }) as Promise<CartWithItems>;
  }

  async findCartItem(
    cartId: string,
    productId: string,
    sizeId: number
  ): Promise<CartItemEntity | null> {
    return prisma.cartItem.findUnique({
      where: {
        cartId_productId_sizeId: { cartId, productId, sizeId },
      },
      include: cartItemInclude,
    }) as Promise<CartItemEntity | null>;
  }

  async createCartItem(
    cartId: string,
    productId: string,
    sizeId: number,
    quantity: number
  ): Promise<CartItemEntity> {
    return prisma.cartItem.create({
      data: { cartId, productId, sizeId, quantity },
      include: cartItemInclude,
    }) as Promise<CartItemEntity>;
  }

  async updateCartItemQuantity(
    cartItemId: string,
    quantity: number
  ): Promise<CartItemEntity> {
    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: cartItemInclude,
    }) as Promise<CartItemEntity>;
  }

  async deleteCartItem(cartItemId: string): Promise<void> {
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  async findCartItemById(cartItemId: string): Promise<CartItemEntity | null> {
    return prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: cartItemInclude,
    }) as Promise<CartItemEntity | null>;
  }
}
