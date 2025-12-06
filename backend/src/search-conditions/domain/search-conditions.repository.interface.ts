import { SearchConditionEntity } from '../entities/search-condition.entity';

export type SearchConditionsFindManyFilter = {
  formType?: string;
  includeDeleted?: boolean;
};

export interface ISearchConditionsRepository {
  findAll(
    filter?: SearchConditionsFindManyFilter,
  ): Promise<SearchConditionEntity[]>;
  findById(id: string): Promise<SearchConditionEntity | null>;
  create(
    searchCondition: SearchConditionEntity,
  ): Promise<SearchConditionEntity>;
  update(
    searchCondition: SearchConditionEntity,
  ): Promise<SearchConditionEntity>;
  delete(id: string, deletedBy: string, deletedAt: Date): Promise<void>;
}
