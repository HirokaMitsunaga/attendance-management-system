import { Injectable } from '@nestjs/common';
import type { Prisma, SearchCondition } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchConditionEntity } from '../entities/search-condition.entity';
import type {
  ISearchConditionsRepository,
  SearchConditionsFindManyFilter,
} from '../domain/search-conditions.repository.interface';
import { handlePrismaError } from '../../common/utils/prisma-error-handler';
import { CustomLoggerService } from '../../config/custom-logger.service';

@Injectable()
export class SearchConditionsRepository implements ISearchConditionsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService,
  ) {}

  async findAll(
    filter?: SearchConditionsFindManyFilter,
  ): Promise<SearchConditionEntity[]> {
    const includeDeleted = filter?.includeDeleted ?? false;

    const where: Prisma.SearchConditionWhereInput = {
      ...(includeDeleted ? {} : { deletedAt: null }),
      ...(filter?.formType && { formType: filter.formType }),
    };

    const rows = await this.prisma.searchCondition.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: string): Promise<SearchConditionEntity | null> {
    const row = await this.prisma.searchCondition.findUnique({
      where: { id, deletedAt: null },
    });
    if (!row) return null;
    return this.toEntity(row);
  }

  async create(
    searchCondition: SearchConditionEntity,
  ): Promise<SearchConditionEntity> {
    // 新規作成時はidが未設定のため、toPrimitives()を使わずに直接プロパティを取得
    try {
      const created = await this.prisma.searchCondition.create({
        data: {
          formType: searchCondition.formType,
          name: searchCondition.name,
          urlParams: searchCondition.urlParams,
          createdBy: searchCondition.createdBy,
          updatedBy: searchCondition.updatedBy,
          deletedAt: searchCondition.deletedAt ?? null,
          deletedBy: searchCondition.deletedBy ?? null,
        },
      });
      return this.toEntity(created);
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        undefined,
        'SearchConditionsRepository',
      );
      handlePrismaError(error, {
        resourceName: '検索条件',
        id: searchCondition.name,
        duplicateMessage: 'この名前の検索条件は既に登録されています',
      });
      throw error;
    }
  }

  async update(
    searchCondition: SearchConditionEntity,
  ): Promise<SearchConditionEntity> {
    const primitives = searchCondition.toPrimitives();
    try {
      const updated = await this.prisma.searchCondition.update({
        where: { id: primitives.id },
        data: {
          formType: primitives.formType,
          name: primitives.name,
          urlParams: primitives.urlParams,
          updatedBy: primitives.updatedBy,
          deletedAt: primitives.deletedAt ?? null,
          deletedBy: primitives.deletedBy ?? null,
        },
      });
      return this.toEntity(updated);
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        undefined,
        'SearchConditionsRepository',
      );
      handlePrismaError(error, {
        resourceName: '検索条件',
        id: primitives.id,
        duplicateMessage: 'この名前の検索条件は既に登録されています',
      });
      throw error;
    }
  }

  async delete(id: string, deletedBy: string, deletedAt: Date): Promise<void> {
    try {
      await this.prisma.searchCondition.update({
        where: { id },
        data: {
          deletedAt,
          deletedBy,
          updatedBy: deletedBy,
        },
      });
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        undefined,
        'SearchConditionsRepository',
      );
      handlePrismaError(error, {
        resourceName: '検索条件',
        id,
      });
      throw error;
    }
  }

  private toEntity(row: SearchCondition): SearchConditionEntity {
    return SearchConditionEntity.reconstruct({
      id: row.id,
      formType: row.formType,
      name: row.name,
      urlParams: row.urlParams,
      createdAt: row.createdAt,
      createdBy: row.createdBy,
      updatedAt: row.updatedAt,
      updatedBy: row.updatedBy,
      deletedAt: row.deletedAt,
      deletedBy: row.deletedBy,
    });
  }
}
