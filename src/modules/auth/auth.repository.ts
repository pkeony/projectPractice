import prisma from '../../common/database/prisma';
import { UserType } from '@prisma/client';

//Auth 관련 DB 접근 계층

export class AuthRepository {
  //email로 사용자 조회
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  //새 사용자 생성
  async createUser(data: {
    email: string;
    password: string;
    name: string;
    type: UserType;
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        type: data.type,
        points: 999,
        gradeId: 'grade_green',
        image:
          'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/codiit/1749477485230-user_default.png',
      },
    });
  }
}
