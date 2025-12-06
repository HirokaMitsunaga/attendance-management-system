import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersRepository } from './infrastructure/users.repository';
import { FindAllUsersUseCase } from './use-cases/find-all-users.use-case';
import { FindUserUseCase } from './use-cases/find-user.use-case';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';
import { DeleteUserUseCase } from './use-cases/delete-user.use-case';
import { SearchUsersUseCase } from './use-cases/search-users.use-case';
import { ExportUsersUseCase } from './use-cases/export-users.use-case';

@Module({
  controllers: [UsersController],
  providers: [
    UsersRepository,
    FindAllUsersUseCase,
    FindUserUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    SearchUsersUseCase,
    ExportUsersUseCase,
  ],
})
export class UsersModule {}
