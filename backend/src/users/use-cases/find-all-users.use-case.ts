import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import type { UserListResponseDto } from '../dto/user-list-response.dto';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../common/constants';

type FindAllUsersParams = {
  page?: number;
  pageSize?: number;
};

@Injectable()
export class FindAllUsersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(params: FindAllUsersParams = {}): Promise<UserListResponseDto> {
    const { page = DEFAULT_PAGE, pageSize = DEFAULT_PAGE_SIZE } = params;
    const [entities, total] = await Promise.all([
      this.usersRepository.findAll({ page, pageSize }),
      this.usersRepository.count(),
    ]);
    return {
      users: entities.map((u) => u.toPrimitives()),
      total,
      page,
      pageSize,
    };
  }
}
