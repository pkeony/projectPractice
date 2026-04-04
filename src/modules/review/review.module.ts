import { Router } from 'express';
import { ReviewController } from './review.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authMiddleware } from '../../common/middlewares/auth';

const reviewRouter = Router();
const reviewController = new ReviewController();

reviewRouter.get(
  '/product/:productId',
  asyncHandler(reviewController.getReviewsByProduct)
);
reviewRouter.post(
  '/',
  authMiddleware,
  asyncHandler(reviewController.createReview)
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
