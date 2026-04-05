import { Router } from 'express';
import { ReviewController } from './review.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authMiddleware } from '../../common/middlewares/auth';

const reviewRouter = Router();
const reviewController = new ReviewController();

// When mounted at /product: GET /product/:productId/reviews, POST /product/:productId/reviews
reviewRouter.get(
  '/:productId/reviews',
  asyncHandler(reviewController.getReviewsByProduct)
);
reviewRouter.post(
  '/:productId/reviews',
  authMiddleware,
  asyncHandler(reviewController.createReview)
);

// When mounted at /review: GET /review/:reviewId, PATCH /review/:reviewId, DELETE /review/:reviewId
reviewRouter.get(
  '/:reviewId',
  asyncHandler(reviewController.getReviewById)
);
reviewRouter.patch(
  '/:reviewId',
  authMiddleware,
  asyncHandler(reviewController.updateReview)
);
reviewRouter.delete(
  '/:reviewId',
  authMiddleware,
  asyncHandler(reviewController.deleteReview)
);

export default reviewRouter;
