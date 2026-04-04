import prisma from '../../common/database/prisma';
import {
  InquiryWithDetail,
  InquirySummary,
  InquiryReplyEntity,
} from './types/inquiry.types';

const inquiryDetailInclude = {
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
      store: {
        select: {
          id: true,
          name: true,
          userId: true,
        },
      },
    },
  },
  reply: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  },
};

const inquirySummaryInclude = {
  user: {
    select: {
      id: true,
      name: true,
    },
  },
  reply: {
    select: { id: true },
  },
};

export class InquiryRepository {
  async findById(inquiryId: string): Promise<InquiryWithDetail | null> {
    return prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: inquiryDetailInclude,
    }) as Promise<InquiryWithDetail | null>;
  }

  async findByProductId(
    productId: string,
    page: number,
    limit: number
  ): Promise<{ inquiries: InquirySummary[]; total: number }> {
    const skip = (page - 1) * limit;

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: inquirySummaryInclude,
      }),
      prisma.inquiry.count({ where: { productId } }),
    ]);

    return { inquiries: inquiries as InquirySummary[], total };
  }

  async create(data: {
    userId: string;
    productId: string;
    title: string;
    content: string;
    isSecret: boolean;
  }): Promise<InquiryWithDetail> {
    return prisma.inquiry.create({
      data,
      include: inquiryDetailInclude,
    }) as Promise<InquiryWithDetail>;
  }

  async update(
    inquiryId: string,
    data: { title?: string; content?: string; isSecret?: boolean }
  ): Promise<InquiryWithDetail> {
    return prisma.inquiry.update({
      where: { id: inquiryId },
      data,
      include: inquiryDetailInclude,
    }) as Promise<InquiryWithDetail>;
  }

  async updateStatus(inquiryId: string, status: string): Promise<void> {
    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: status as any },
    });
  }

  async delete(inquiryId: string): Promise<void> {
    await prisma.inquiry.delete({
      where: { id: inquiryId },
    });
  }

  async createReply(data: {
    inquiryId: string;
    userId: string;
    content: string;
  }): Promise<InquiryReplyEntity> {
    return prisma.inquiryReply.create({
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
    }) as Promise<InquiryReplyEntity>;
  }

  async findReplyById(replyId: string): Promise<InquiryReplyEntity | null> {
    return prisma.inquiryReply.findUnique({
      where: { id: replyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }) as Promise<InquiryReplyEntity | null>;
  }

  async updateReply(
    replyId: string,
    content: string
  ): Promise<InquiryReplyEntity> {
    return prisma.inquiryReply.update({
      where: { id: replyId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }) as Promise<InquiryReplyEntity>;
  }

  async deleteReply(replyId: string): Promise<void> {
    await prisma.inquiryReply.delete({
      where: { id: replyId },
    });
  }
}
