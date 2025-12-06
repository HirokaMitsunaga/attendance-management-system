import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import type { UserResponseDto } from '../dto/user-response.dto';
import { getCurrentDate } from '../../common/utils/date.utils';
import { validateUserExists } from '../utils/user-validator.utils';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string, userId: string): Promise<UserResponseDto> {
    const existing = validateUserExists(
      await this.usersRepository.findById(id),
      id,
    );

    existing.delete(userId, getCurrentDate());
    const deleted = await this.usersRepository.update(existing);
    return deleted.toPrimitives();
  }
}
