import { Router } from 'express';
import { InquiryController } from './inquiry.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import {
  authMiddleware,
  optionalAuthMiddleware,
} from '../../common/middlewares/auth';

const inquiryRouter = Router();
const inquiryController = new InquiryController();

// 문의
inquiryRouter.get(
  '/product/:productId',
  optionalAuthMiddleware,
  asyncHandler(inquiryController.getInquiriesByProduct)
);

inquiryRouter.get(
  '/:inquiryId',
  optionalAuthMiddleware,
  asyncHandler(inquiryController.getInquiryById)
);

inquiryRouter.post(
  '/',
  authMiddleware,
  asyncHandler(inquiryController.createInquiry)
);

inquiryRouter.patch(
  '/:inquiryId',
  authMiddleware,
  asyncHandler(inquiryController.updateInquiry)
);

inquiryRouter.delete(
  '/:inquiryId',
  authMiddleware,
  asyncHandler(inquiryController.deleteInquiry)
);

// 답변
inquiryRouter.post(
  '/:inquiryId/reply',
  authMiddleware,
  asyncHandler(inquiryController.createReply)
);

inquiryRouter.patch(
  '/reply/:replyId',
  authMiddleware,
  asyncHandler(inquiryController.updateReply)
);

inquiryRouter.delete(
  '/reply/:replyId',
  authMiddleware,
  asyncHandler(inquiryController.deleteReply)
);

export default inquiryRouter;
