import { CartRepository } from './cart.repository';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponse, CartWithItems } from './types/cart.types';
import { AppError } from '../../common/types/errors';
import prisma from '../../common/database/prisma';

const cartRepository = new CartRepository();

export class CartService {
  private calculateCartTotals(cart: CartWithItems): CartResponse {
    let totalPrice = 0;
    let totalDiscountedPrice = 0;
    let totalItems = 0;

    for (const item of cart.items) {
      const itemTotal = item.product.price * item.quantity;
      const discountedTotal = Math.floor(
        itemTotal * (1 - item.product.discountRate / 100)
      );

      totalPrice += itemTotal;
      totalDiscountedPrice += discountedTotal;
      totalItems += item.quantity;
    }

    return { cart, totalPrice, totalDiscountedPrice, totalItems };
  }

  async getMyCart(buyerId: string): Promise<CartResponse> {
    let cart = await cartRepository.findByBuyerId(buyerId);

    if (!cart) {
      cart = await cartRepository.createCart(buyerId);
    }

    return this.calculateCartTotals(cart);
  }

  async addCartItem(
    buyerId: string,
    addCartItemDto: AddCartItemDto
  ): Promise<CartResponse> {
    const product = await prisma.product.findUnique({
      where: { id: addCartItemDto.productId },
    });

    if (!product) {
      throw new AppError(404, '상품을 찾을 수 없습니다.', 'Not Found');
    }

    if (product.isSoldOut) {
      throw new AppError(400, '품절된 상품입니다.', 'Bad Request');
    }

    const size = await prisma.size.findUnique({
      where: { id: addCartItemDto.sizeId },
    });

    if (!size) {
      throw new AppError(404, '사이즈를 찾을 수 없습니다.', 'Not Found');
    }

    const stock = await prisma.productStock.findUnique({
      where: {
        productId_sizeId: {
          productId: addCartItemDto.productId,
          sizeId: addCartItemDto.sizeId,
        },
      },
    });

    if (!stock || stock.quantity < addCartItemDto.quantity) {
      throw new AppError(400, '재고가 부족합니다.', 'Bad Request');
    }

    let cart = await cartRepository.findByBuyerId(buyerId);

    if (!cart) {
      cart = await cartRepository.createCart(buyerId);
    }

    const existingItem = await cartRepository.findCartItem(
      cart.id,
      addCartItemDto.productId,
      addCartItemDto.sizeId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + addCartItemDto.quantity;

      if (stock.quantity < newQuantity) {
        throw new AppError(400, '재고가 부족합니다.', 'Bad Request');
      }

      await cartRepository.updateCartItemQuantity(existingItem.id, newQuantity);
    } else {
      await cartRepository.createCartItem(
        cart.id,
        addCartItemDto.productId,
        addCartItemDto.sizeId,
        addCartItemDto.quantity
      );
    }

    const updatedCart = await cartRepository.findByBuyerId(buyerId);

    return this.calculateCartTotals(updatedCart!);
  }

  async updateCartItem(
    buyerId: string,
    cartItemId: string,
    updateCartItemDto: UpdateCartItemDto
  ): Promise<CartResponse> {
    const cart = await cartRepository.findByBuyerId(buyerId);

    if (!cart) {
      throw new AppError(404, '장바구니가 없습니다.', 'Not Found');
    }

    const cartItem = await cartRepository.findCartItemById(cartItemId);

    if (!cartItem) {
      throw new AppError(
        404,
        '장바구니 아이템을 찾을 수 없습니다.',
        'Not Found'
      );
    }

    if (cartItem.cartId !== cart.id) {
      throw new AppError(
        403,
        '본인의 장바구니만 수정할 수 있습니다.',
        'Forbidden'
      );
    }

    const stock = await prisma.productStock.findUnique({
      where: {
        productId_sizeId: {
          productId: cartItem.productId,
          sizeId: cartItem.sizeId,
        },
      },
    });

    if (!stock || stock.quantity < updateCartItemDto.quantity) {
      throw new AppError(400, '재고가 부족합니다.', 'Bad Request');
    }

    await cartRepository.updateCartItemQuantity(
      cartItemId,
      updateCartItemDto.quantity
    );

    const updatedCart = await cartRepository.findByBuyerId(buyerId);

    return this.calculateCartTotals(updatedCart!);
  }

  async deleteCartItem(
    buyerId: string,
    cartItemId: string
  ): Promise<CartResponse> {
    const cart = await cartRepository.findByBuyerId(buyerId);

    if (!cart) {
      throw new AppError(404, '장바구니가 없습니다.', 'Not Found');
    }

    const cartItem = await cartRepository.findCartItemById(cartItemId);

    if (!cartItem) {
      throw new AppError(
        404,
        '장바구니 아이템을 찾을 수 없습니다.',
        'Not Found'
      );
    }

    if (cartItem.cartId !== cart.id) {
      throw new AppError(
        403,
        '본인의 장바구니만 수정할 수 있습니다.',
        'Forbidden'
      );
    }

    await cartRepository.deleteCartItem(cartItemId);

    const updatedCart = await cartRepository.findByBuyerId(buyerId);

    return this.calculateCartTotals(updatedCart!);
  }
}
