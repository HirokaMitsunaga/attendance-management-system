import type { Gender, UserRole } from '@prisma/client';

export type UserResponseDto = {
  id?: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  gender: Gender | null;
  createdAt?: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy: string;
  deletedAt?: Date | null;
  deletedBy?: string | null;
};
