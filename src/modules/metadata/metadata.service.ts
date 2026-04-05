import prisma from '../../common/database/prisma';

export class MetadataService {
  async getGrades() {
    const grades = await prisma.grade.findMany({
      select: {
        id: true,
        name: true,
        rate: true,
        minAmount: true,
      },
      orderBy: { minAmount: 'asc' },
    });
    return grades;
  }
}
