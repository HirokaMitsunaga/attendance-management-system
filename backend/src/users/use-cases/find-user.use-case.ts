import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import type { UserResponseDto } from '../dto/user-response.dto';
import { NotFoundError } from '../../common/errors/not-found.error';

@Injectable()
export class FindUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user || user.deletedAt) {
      throw new NotFoundError('ユーザー', id);
    }
    return user.toPrimitives();
  }
}
