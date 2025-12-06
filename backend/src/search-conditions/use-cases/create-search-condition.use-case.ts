import { Injectable } from '@nestjs/common';
import { SearchConditionsRepository } from '../infrastructure/search-conditions.repository';
import { SearchConditionEntity } from '../entities/search-condition.entity';
import { SearchConditionResponseDto } from '../dto/search-condition-response.dto';

type CreateSearchConditionParams = {
  formType: string;
  name: string;
  urlParams: string;
  userId: string;
};

@Injectable()
export class CreateSearchConditionUseCase {
  constructor(
    private readonly searchConditionsRepository: SearchConditionsRepository,
  ) {}

  async execute(
    params: CreateSearchConditionParams,
  ): Promise<SearchConditionResponseDto> {
    const entity = SearchConditionEntity.createNew({
      formType: params.formType,
      name: params.name,
      urlParams: params.urlParams,
      userId: params.userId,
    });

    const created = await this.searchConditionsRepository.create(entity);
    return SearchConditionResponseDto.fromEntity(created);
  }
}
