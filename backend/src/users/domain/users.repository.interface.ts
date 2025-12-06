import type { UserRole, Gender } from '@prisma/client';
import { UserEntity } from '../entities/user.entity';

export type UsersFindManyFilter = {
  includeDeleted?: boolean;
  id?: string;
  search?: string;
  role?: UserRole;
  gender?: Gender | null;
  page?: number;
  pageSize?: number;
};

export interface IUsersRepository {
  findAll(filter?: UsersFindManyFilter): Promise<UserEntity[]>;
  findById(id: string): Promise<UserEntity | null>;
  create(user: UserEntity): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;
  count(filter?: UsersFindManyFilter): Promise<number>;
}
