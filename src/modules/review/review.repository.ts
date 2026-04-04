import prisma from '../../common/database/prisma';
import { ReviewWithUser, ReviewWithDetail } from './types/review.types';

export class ReviewRepository {
  async findById(reviewId: string): Promise<ReviewWithDetail | null> {
    return prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },

        product: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }) as Promise<ReviewWithDetail | null>;
  }

  async findByOrderItemId(orderItemId: string): Promise<ReviewWithUser | null> {
    return prisma.review.findUnique({
      where: { orderItemId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }) as Promise<ReviewWithUser | null>;
  }

  async findByProductId(
    productId: string,
    page: number,
    limit: number
  ): Promise<{ reviews: ReviewWithUser[]; total: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    return { reviews: reviews as ReviewWithUser[], total };
  }

  async create(data: {
    userId: string;
    productId: string;
    orderItemId: string;
    rating: number;
    content: string;
  }): Promise<ReviewWithUser> {
    return prisma.review.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }) as Promise<ReviewWithUser>;
  }

  async update(
    reviewId: string,
    data: { rating?: number; content?: string }
  ): Promise<ReviewWithUser> {
    return prisma.review.update({
      where: { id: reviewId },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }) as Promise<ReviewWithUser>;
  }

  async delete(reviewId: string): Promise<void> {
    await prisma.review.delete({
      where: { id: reviewId },
    });
  }
}
