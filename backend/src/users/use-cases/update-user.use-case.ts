import { Injectable } from '@nestjs/common';
import type { Gender, UserRole } from '@prisma/client';
import { UsersRepository } from '../infrastructure/users.repository';
import type { UserResponseDto } from '../dto/user-response.dto';
import { handlePrismaError } from '../../common/utils/prisma-error-handler';
import { CustomLoggerService } from '../../config/custom-logger.service';
import { validateUserExists } from '../utils/user-validator.utils';

type UpdateUserParams = {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  gender: Gender | null;
  userId: string;
};

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: CustomLoggerService,
  ) {}

  async execute(params: UpdateUserParams): Promise<UserResponseDto> {
    const existing = validateUserExists(
      await this.usersRepository.findById(params.id),
      params.id,
    );

    existing.changeEmail(params.email, params.userId);
    existing.changeRole(params.role, params.userId);
    existing.changeName(params.firstName, params.lastName, params.userId);
    existing.changeGender(params.gender, params.userId);

    try {
      const updated = await this.usersRepository.update(existing);
      return updated.toPrimitives();
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        undefined,
        'UpdateUserUseCase',
      );
      handlePrismaError(error, {
        resourceName: 'ユーザー',
        id: params.id,
        duplicateMessage: 'このメールアドレスは既に登録されています',
      });
      throw error;
    }
  }
}
