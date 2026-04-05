import { Router } from 'express';
import { InquiryController } from './inquiry.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import {
  authMiddleware,
  optionalAuthMiddleware,
} from '../../common/middlewares/auth';

const inquiryRouter = Router();
const inquiryController = new InquiryController();

// 내 문의 조회
inquiryRouter.get(
  '/',
  authMiddleware,
  asyncHandler(inquiryController.getMyInquiries)
);

inquiryRouter.get(
  '/:inquiryId',
  optionalAuthMiddleware,
  asyncHandler(inquiryController.getInquiryById)
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
  '/:inquiryId/replies',
  authMiddleware,
  asyncHandler(inquiryController.createReply)
);

inquiryRouter.patch(
  '/:replyId/replies',
  authMiddleware,
  asyncHandler(inquiryController.updateReply)
);

export default inquiryRouter;
