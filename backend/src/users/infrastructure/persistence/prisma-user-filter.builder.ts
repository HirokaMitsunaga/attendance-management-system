import type { Prisma } from '@prisma/client';
import type { UsersFindManyFilter } from '../../domain/users.repository.interface';
import { splitIds } from '../../../common/utils/string.utils';

export class PrismaUserFilterBuilder {
  static build(filter?: UsersFindManyFilter): Prisma.UserWhereInput {
    const includeDeleted = filter?.includeDeleted ?? false;

    return {
      ...(includeDeleted ? {} : { deletedAt: null }),
      ...(filter?.id && {
        id: {
          in: splitIds(filter.id),
        },
      }),
      ...(filter?.search && {
        OR: [
          { email: { contains: filter.search, mode: 'insensitive' } },
          { firstName: { contains: filter.search, mode: 'insensitive' } },
          { lastName: { contains: filter.search, mode: 'insensitive' } },
        ],
      }),
      ...(filter?.role !== undefined && { role: filter.role }),
      ...(filter?.gender !== undefined && { gender: filter.gender }),
    };
  }
}
