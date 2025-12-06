import type { Prisma, User } from '@prisma/client';
import { UserEntity } from '../../entities/user.entity';
import { UserEmail } from '../../value-objects/user-email.vo';
import { UserName } from '../../value-objects/user-name.vo';

export class PrismaUserMapper {
  // Prisma(DB) -> Entity
  static toEntity(row: User): UserEntity {
    return UserEntity.reconstruct({
      id: row.id,
      email: UserEmail.create(row.email),
      role: row.role,
      name: UserName.create({
        firstName: row.firstName,
        lastName: row.lastName,
      }),
      gender: row.gender,
      createdAt: row.createdAt,
      createdBy: row.createdBy,
      updatedAt: row.updatedAt,
      updatedBy: row.updatedBy,
      deletedAt: row.deletedAt,
      deletedBy: row.deletedBy,
    });
  }

  // Entity -> Prisma(DB Input)
  // create/updateで共通して使える形にする
  static toPrismaInput(entity: UserEntity): Prisma.UserUncheckedCreateInput {
    const p = entity.toPrimitives();
    return {
      id: p.id,
      email: p.email,
      role: p.role,
      firstName: p.firstName,
      lastName: p.lastName,
      gender: p.gender,
      createdBy: p.createdBy,
      updatedBy: p.updatedBy,
      deletedAt: p.deletedAt ?? null,
      deletedBy: p.deletedBy ?? null,
    };
  }
}
