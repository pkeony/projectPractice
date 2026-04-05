import { InquiryRepository } from './inquiry.repository';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { CreateInquiryReplyDto } from './dto/create-inquiry-reply.dto';
import { InquiryWithDetail, InquirySummary } from './types/inquiry.types';
import { PaginatedResult } from '../../common/types/pagination';
import { AppError } from '../../common/types/errors';
import prisma from '../../common/database/prisma';
import { notificationService } from '../notification/notification.service';

const inquiryRepository = new InquiryRepository();

export class InquiryService {
  async getMyInquiries(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<any> {
    const { inquiries, total } = await inquiryRepository.findByUserId(
      userId,
      page,
      pageSize
    );

    return {
      list: inquiries,
      totalCount: total,
    };
  }

  async getInquiriesByProduct(
    productId: string,
    page: number,
    limit: number,
    userId?: string
  ): Promise<PaginatedResult<InquirySummary>> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: { select: { userId: true } },
      },
    });

    if (!product) {
      throw new AppError(404, '상품을 찾을 수 없습니다.', 'Not Found');
    }

    const { inquiries, total } = await inquiryRepository.findByProductId(
      productId,
      page,
      limit
    );

    const isStoreOwner = product.store.userId === userId;

    const filteredInquiries = inquiries.map((inquiry) => {
      if (inquiry.isSecret && inquiry.userId !== userId && !isStoreOwner) {
        return {
          ...inquiry,
          title: '비밀글입니다.',
          user: { id: '', name: '***' },
        };
      }
      return inquiry;
    });

    return {
      data: filteredInquiries as InquirySummary[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getInquiryById(
    inquiryId: string,
    userId?: string
  ): Promise<InquiryWithDetail> {
    const inquiry = await inquiryRepository.findById(inquiryId);

    if (!inquiry) {
      throw new AppError(404, '문의를 찾을 수 없습니다.', 'Not Found');
    }

    const isStoreOwner = inquiry.product.store.userId === userId;

    if (inquiry.isSecret && inquiry.userId !== userId && !isStoreOwner) {
      throw new AppError(
        403,
        '비밀글은 작성자와 판매자만 볼 수 있습니다.',
        'Forbidden'
      );
    }

    return inquiry;
  }

  async createInquiry(
    userId: string,
    createInquiryDto: CreateInquiryDto
  ): Promise<InquiryWithDetail> {
    const product = await prisma.product.findUnique({
      where: { id: createInquiryDto.productId },
      include: { store: { select: { userId: true } } },
    });

    if (!product) {
      throw new AppError(404, '상품을 찾을 수 없습니다.', 'Not Found');
    }

    const inquiry = await inquiryRepository.create({
      userId,
      productId: createInquiryDto.productId,
      title: createInquiryDto.title,
      content: createInquiryDto.content,
      isSecret: createInquiryDto.isSecret ?? false,
    });

    await notificationService.sendNotification(
      product.store.userId,
      `새로운 문의가 등록되었습니다: "${createInquiryDto.title}"`,
      'NEW_INQUIRY'
    );

    return inquiry;
  }

  async updateInquiry(
    userId: string,
    inquiryId: string,
    updateInquiryDto: UpdateInquiryDto
  ): Promise<InquiryWithDetail> {
    const inquiry = await inquiryRepository.findById(inquiryId);

    if (!inquiry) {
      throw new AppError(404, '문의를 찾을 수 없습니다.', 'Not Found');
    }

    if (inquiry.userId !== userId) {
      throw new AppError(403, '본인의 문의만 수정할 수 있습니다.', 'Forbidden');
    }

    if (inquiry.reply) {
      throw new AppError(
        400,
        '답변이 달린 문의는 수정할 수 없습니다.',
        'Bad Request'
      );
    }

    const updatedInquiry = await inquiryRepository.update(
      inquiryId,
      updateInquiryDto
    );

    return updatedInquiry;
  }

  async deleteInquiry(
    userId: string,
    inquiryId: string
  ): Promise<{ message: string }> {
    const inquiry = await inquiryRepository.findById(inquiryId);

    if (!inquiry) {
      throw new AppError(404, '문의를 찾을 수 없습니다.', 'Not Found');
    }

    if (inquiry.userId !== userId) {
      throw new AppError(403, '본인의 문의만 삭제할 수 있습니다.', 'Forbidden');
    }

    await inquiryRepository.delete(inquiryId);

    return { message: '문의가 삭제되었습니다.' };
  }

  async createReply(
    userId: string,
    inquiryId: string,
    createReplyDto: CreateInquiryReplyDto
  ): Promise<InquiryWithDetail> {
    const inquiry = await inquiryRepository.findById(inquiryId);

    if (!inquiry) {
      throw new AppError(404, '문의를 찾을 수 없습니다.', 'Not Found');
    }

    if (inquiry.product.store.userId !== userId) {
      throw new AppError(
        403,
        '본인 가게의 문의만 답변할 수 있습니다.',
        'Forbidden'
      );
    }

    if (inquiry.reply) {
      throw new AppError(400, '이미 답변이 등록되었습니다.', 'Bad Request');
    }

    await inquiryRepository.createReply({
      inquiryId,
      userId,
      content: createReplyDto.content,
    });

    await inquiryRepository.updateStatus(inquiryId, 'CompletedAnswer');

    await notificationService.sendNotification(
      inquiry.userId,
      `문의에 답변이 등록되었습니다: "${inquiry.title}"`,
      'INQUIRY_REPLIED'
    );

    const updatedInquiry = await inquiryRepository.findById(inquiryId);

    return updatedInquiry!;
  }

  async updateReply(
    userId: string,
    replyId: string,
    content: string
  ): Promise<InquiryWithDetail> {
    const reply = await inquiryRepository.findReplyById(replyId);

    if (!reply) {
      throw new AppError(404, '답변을 찾을 수 없습니다.', 'Not Found');
    }

    if (reply.userId !== userId) {
      throw new AppError(403, '본인의 답변만 수정할 수 있습니다.', 'Forbidden');
    }

    await inquiryRepository.updateReply(replyId, content);

    const inquiry = await inquiryRepository.findById(reply.inquiryId);

    return inquiry!;
  }

  async deleteReply(
    userId: string,
    replyId: string
  ): Promise<InquiryWithDetail> {
    const reply = await inquiryRepository.findReplyById(replyId);

    if (!reply) {
      throw new AppError(404, '답변을 찾을 수 없습니다.', 'Not Found');
    }

    if (reply.userId !== userId) {
      throw new AppError(403, '본인의 답변만 삭제할 수 있습니다.', 'Forbidden');
    }

    const inquiryId = reply.inquiryId;

    await inquiryRepository.deleteReply(replyId);
    await inquiryRepository.updateStatus(inquiryId, 'WaitingAnswer');

    const inquiry = await inquiryRepository.findById(inquiryId);

    return inquiry!;
  }
}
