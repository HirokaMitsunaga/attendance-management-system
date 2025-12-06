import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserEntity } from '../entities/user.entity';
import type {
  IUsersRepository,
  UsersFindManyFilter,
} from '../domain/users.repository.interface';
import { PrismaUserFilterBuilder } from './persistence/prisma-user-filter.builder';
import { PrismaUserMapper } from './persistence/prisma-user.mapper';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../common/constants';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter?: UsersFindManyFilter): Promise<UserEntity[]> {
    const where = PrismaUserFilterBuilder.build(filter);

    // ページネーションが指定されている場合のみ適用
    const shouldPaginate =
      filter?.page !== undefined || filter?.pageSize !== undefined;
    const page: number = filter?.page ?? DEFAULT_PAGE;
    const pageSize: number = filter?.pageSize ?? DEFAULT_PAGE_SIZE;
    const skip = shouldPaginate ? (page - 1) * pageSize : undefined;
    const take = shouldPaginate ? pageSize : undefined;

    const rows = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
    });

    return rows.map((row) => PrismaUserMapper.toEntity(row)) as UserEntity[];
  }

  async count(filter?: UsersFindManyFilter): Promise<number> {
    const where = PrismaUserFilterBuilder.build(filter);
    return this.prisma.user.count({ where });
  }

  async findById(id: string): Promise<UserEntity | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!row) return null;
    return PrismaUserMapper.toEntity(row);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const data = PrismaUserMapper.toPrismaInput(user);
    const created = await this.prisma.user.create({
      data,
    });
    return PrismaUserMapper.toEntity(created);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const primitives = user.toPrimitives();
    const data = PrismaUserMapper.toPrismaInput(user);
    const updated = await this.prisma.user.update({
      where: { id: primitives.id! },
      data,
    });
    return PrismaUserMapper.toEntity(updated);
  }
}
