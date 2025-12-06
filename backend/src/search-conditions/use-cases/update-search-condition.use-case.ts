import { Injectable } from '@nestjs/common';
import { SearchConditionsRepository } from '../infrastructure/search-conditions.repository';
import { SearchConditionResponseDto } from '../dto/search-condition-response.dto';
import { NotFoundError } from '../../common/errors/not-found.error';

type UpdateSearchConditionParams = {
  id: string;
  name: string;
  userId: string;
};

@Injectable()
export class UpdateSearchConditionUseCase {
  constructor(
    private readonly searchConditionsRepository: SearchConditionsRepository,
  ) {}

  async execute(
    params: UpdateSearchConditionParams,
  ): Promise<SearchConditionResponseDto> {
    const existing = await this.searchConditionsRepository.findById(params.id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundError('検索条件', params.id);
    }

    existing.changeName(params.name, params.userId);

    const updated = await this.searchConditionsRepository.update(existing);
    return SearchConditionResponseDto.fromEntity(updated);
  }
}
