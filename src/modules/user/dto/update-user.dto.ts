import { UserType } from '@prisma/client';

export interface UpdateUserDto {
  name?: string;
  image?: string;
  type?: UserType;
}
