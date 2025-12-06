import { Injectable } from '@nestjs/common';
import type { Gender, UserRole } from '@prisma/client';
import { UsersRepository } from '../infrastructure/users.repository';
import type { UserListResponseDto } from '../dto/user-list-response.dto';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../common/constants';
import { buildUserFilter } from '../utils/filter-builder.utils';

type SearchUsersParams = {
  id?: string;
  search?: string;
  role?: UserRole;
  gender?: Gender | null | undefined;
  page?: number;
  pageSize?: number;
};

@Injectable()
export class SearchUsersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(params: SearchUsersParams): Promise<UserListResponseDto> {
    const filter = buildUserFilter(params);

    const [entities, total] = await Promise.all([
      this.usersRepository.findAll(filter),
      this.usersRepository.count(filter),
    ]);
    return {
      users: entities.map((user) => user.toPrimitives()),
      total,
      page: params.page ?? DEFAULT_PAGE,
      pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
    };
  }
}
