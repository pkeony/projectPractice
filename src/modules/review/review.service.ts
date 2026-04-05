import { ReviewRepository } from './review.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewWithUser, ReviewWithDetail } from './types/review.types';
import { AppError } from '../../common/types/errors';
import prisma from '../../common/database/prisma';

const reviewRepository = new ReviewRepository();

export class ReviewService {
  async getReviewsByProduct(
    productId: string,
    page: number,
    limit: number
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError(404, '상품을 찾을 수 없습니다.', 'Not Found');
    }

    const { reviews, total } = await reviewRepository.findByProductId(
      productId,
      page,
      limit
    );

    return {
      items: reviews,
      meta: {
        total,
        page,
        limit,
        hasNextPage: page * limit < total,
      },
    };
  }

  async getReviewById(reviewId: string): Promise<ReviewWithDetail> {
    const review = await reviewRepository.findById(reviewId);

    if (!review) {
      throw new AppError(404, '리뷰를 찾을 수 없습니다.', 'Not Found');
    }

    return review;
  }

  async createReview(
    userId: string,
    createReviewDto: CreateReviewDto
  ): Promise<ReviewWithUser> {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: createReviewDto.orderItemId },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      throw new AppError(404, '주문 항목을 찾을 수 없습니다.', 'Not Found');
    }

    if (orderItem.order.buyerId !== userId) {
      throw new AppError(403, '본인의 주문만 리뷰할 수 있습니다.', 'Forbidden');
    }

    if (orderItem.order.status !== 'CompletedPayment') {
      throw new AppError(
        400,
        '결제 완료된 주문만 리뷰할 수 있습니다.',
        'Bad Request'
      );
    }

    if (orderItem.productId !== createReviewDto.productId) {
      throw new AppError(
        400,
        '주문 항목과 상품이 일치하지 않습니다.',
        'Bad Request'
      );
    }

    const existingReview = await reviewRepository.findByOrderItemId(
      createReviewDto.orderItemId
    );

    if (existingReview) {
      throw new AppError(409, '이미 리뷰를 작성했습니다.', 'Conflict');
    }

    const review = await reviewRepository.create({
      userId,
      productId: createReviewDto.productId,
      orderItemId: createReviewDto.orderItemId,
      rating: createReviewDto.rating,
      content: createReviewDto.content,
    });

    return review;
  }

  async updateReview(
    userId: string,
    reviewId: string,
    updateReviewDto: UpdateReviewDto
  ): Promise<ReviewWithUser> {
    const review = await reviewRepository.findById(reviewId);

    if (!review) {
      throw new AppError(404, '리뷰를 찾을 수 없습니다.', 'Not Found');
    }

    if (review.userId !== userId) {
      throw new AppError(403, '본인의 리뷰만 수정할 수 있습니다.', 'Forbidden');
    }

    const updateReview = await reviewRepository.update(
      reviewId,
      updateReviewDto
    );

    return updateReview;
  }

  async deleteReview(
    userId: string,
    reviewId: string
  ): Promise<{ message: string }> {
    const review = await reviewRepository.findById(reviewId);

    if (!review) {
      throw new AppError(404, '리뷰를 찾을 수 없습니다.', 'Not Found');
    }

    if (review.userId !== userId) {
      throw new AppError(403, '본인의 리뷰만 삭제할 수 있습니다.', 'Forbidden');
    }

    await reviewRepository.delete(reviewId);

    return { message: '리뷰가 삭제되었습니다.' };
  }
}
