import { Injectable } from '@nestjs/common';
import type { Gender, UserRole } from '@prisma/client';
import { UsersRepository } from '../infrastructure/users.repository';
import type { UserResponseDto } from '../dto/user-response.dto';
import { buildUserFilterWithoutPagination } from '../utils/filter-builder.utils';

type ExportUsersParams = {
  id?: string;
  search?: string;
  role?: UserRole;
  gender?: Gender | null;
};

@Injectable()
export class ExportUsersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(params: ExportUsersParams): Promise<UserResponseDto[]> {
    // ページネーションなしで全件取得（pageとpageSizeは設定しない）
    const filter = buildUserFilterWithoutPagination(params);
    const entities = await this.usersRepository.findAll(filter);
    return entities.map((user) => user.toPrimitives());
  }
}
