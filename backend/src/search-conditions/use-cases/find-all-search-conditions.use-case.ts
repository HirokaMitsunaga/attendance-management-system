import { Injectable } from '@nestjs/common';
import { SearchConditionsRepository } from '../infrastructure/search-conditions.repository';
import { SearchConditionResponseDto } from '../dto/search-condition-response.dto';

type FindAllSearchConditionsParams = {
  formType?: string;
};

@Injectable()
export class FindAllSearchConditionsUseCase {
  constructor(
    private readonly searchConditionsRepository: SearchConditionsRepository,
  ) {}

  async execute(
    params: FindAllSearchConditionsParams = {},
  ): Promise<SearchConditionResponseDto[]> {
    const entities = await this.searchConditionsRepository.findAll({
      formType: params.formType,
    });
    return entities.map((entity) =>
      SearchConditionResponseDto.fromEntity(entity),
    );
  }
}
