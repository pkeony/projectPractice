import { Response } from 'express';
import { InquiryService } from './inquiry.service';
import { AuthRequest } from '../../common/types/auth';
import {
  validateCreateInquiry,
  validateUpdateInquiry,
  validateCreateReply,
} from './validators/inquiry.validator';

const inquiryService = new InquiryService();

export class InquiryController {
  async getMyInquiries(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const status = req.query.status as string | undefined;

    const result = await inquiryService.getMyInquiries(
      userId,
      page,
      pageSize,
      status
    );

    res.status(200).json(result);
  }

  async getInquiriesByProduct(req: AuthRequest, res: Response): Promise<void> {
    const productId = req.params.productId as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const userId = req.user?.userId;

    const result = await inquiryService.getInquiriesByProduct(
      productId,
      page,
      limit,
      userId
    );

    res.status(200).json(result);
  }

  async getInquiryById(req: AuthRequest, res: Response): Promise<void> {
    const inquiryId = req.params.inquiryId as string;
    const userId = req.user?.userId;

    const inquiry = await inquiryService.getInquiryById(inquiryId, userId);

    res.status(200).json(inquiry);
  }

  async createInquiry(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;

    validateCreateInquiry(req.body);

    const inquiry = await inquiryService.createInquiry(userId, {
      productId: req.body.productId,
      title: req.body.title,
      content: req.body.content,
      isSecret: req.body.isSecret,
    });

    res.status(201).json(inquiry);
  }

  async updateInquiry(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const inquiryId = req.params.inquiryId as string;

    validateUpdateInquiry(req.body);

    const inquiry = await inquiryService.updateInquiry(userId, inquiryId, {
      title: req.body.title,
      content: req.body.content,
      isSecret: req.body.isSecret,
    });

    res.status(200).json(inquiry);
  }

  async deleteInquiry(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const inquiryId = req.params.inquiryId as string;

    const result = await inquiryService.deleteInquiry(userId, inquiryId);

    res.status(200).json(result);
  }

  async createReply(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const inquiryId = req.params.inquiryId as string;

    validateCreateReply(req.body);

    const inquiry = await inquiryService.createReply(userId, inquiryId, {
      content: req.body.content,
    });

    res.status(201).json(inquiry);
  }

  async updateReply(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const replyId = req.params.replyId as string;

    validateCreateReply(req.body);

    const inquiry = await inquiryService.updateReply(
      userId,
      replyId,
      req.body.content
    );

    res.status(200).json(inquiry);
  }

  async deleteReply(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const replyId = req.params.replyId as string;

    const inquiry = await inquiryService.deleteReply(userId, replyId);

    res.status(200).json(inquiry);
  }
}
