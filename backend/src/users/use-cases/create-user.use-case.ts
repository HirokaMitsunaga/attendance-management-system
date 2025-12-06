import { Injectable } from '@nestjs/common';
import type { Gender, UserRole } from '@prisma/client';
import { UsersRepository } from '../infrastructure/users.repository';
import { UserEntity } from '../entities/user.entity';
import type { UserResponseDto } from '../dto/user-response.dto';
import { handlePrismaError } from '../../common/utils/prisma-error-handler';
import { CustomLoggerService } from '../../config/custom-logger.service';

type CreateUserParams = {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  gender: Gender | null;
  userId: string;
};

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: CustomLoggerService,
  ) {}

  async execute(params: CreateUserParams): Promise<UserResponseDto> {
    const entity = UserEntity.createNew({
      email: params.email,
      role: params.role,
      firstName: params.firstName,
      lastName: params.lastName,
      gender: params.gender,
      userId: params.userId,
    });
    try {
      const created = await this.usersRepository.create(entity);
      return created.toPrimitives();
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        undefined,
        'CreateUserUseCase',
      );
      handlePrismaError(error, {
        resourceName: 'ユーザー',
        id: params.email,
        duplicateMessage: 'このメールアドレスは既に登録されています',
      });
      throw error;
    }
  }
}
