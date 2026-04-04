import { Response } from 'express';
import { ReviewService } from './review.service';
import { AuthRequest } from '../../common/types/auth';
import {
  validateCreateReview,
  validateUpdateReview,
} from './validators/review.validator';

const reviewService = new ReviewService();

export class ReviewController {
  async getReviewsByProduct(req: AuthRequest, res: Response): Promise<void> {
    const productId = req.params.productId as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await reviewService.getReviewsByProduct(
      productId,
      page,
      limit
    );

    res.status(200).json(result);
  }

  async createReview(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;

    validateCreateReview(req.body);

    const review = await reviewService.createReview(userId, {
      orderItemId: req.body.orderItemId,
      productId: req.body.productId,
      rating: req.body.rating,
      content: req.body.content,
    });

    res.status(201).json(review);
  }

  async updateReview(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const reviewId = req.params.reviewId as string;

    validateUpdateReview(req.body);

    const review = await reviewService.updateReview(userId, reviewId, {
      rating: req.body.rating,
      content: req.body.content,
    });

    res.status(200).json(review);
  }

  async deleteReview(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const reviewId = req.params.reviewId as string;

    const result = await reviewService.deleteReview(userId, reviewId);

    res.status(200).json(result);
  }
}
