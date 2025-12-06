import { Injectable } from '@nestjs/common';
import { SearchConditionsRepository } from '../infrastructure/search-conditions.repository';
import { NotFoundError } from '../../common/errors/not-found.error';
import { getCurrentDate } from '../../common/utils/date.utils';

type DeleteSearchConditionParams = {
  id: string;
  userId: string;
};

@Injectable()
export class DeleteSearchConditionUseCase {
  constructor(
    private readonly searchConditionsRepository: SearchConditionsRepository,
  ) {}

  async execute(params: DeleteSearchConditionParams): Promise<void> {
    const existing = await this.searchConditionsRepository.findById(params.id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundError('検索条件', params.id);
    }

    await this.searchConditionsRepository.delete(
      params.id,
      params.userId,
      getCurrentDate(),
    );
  }
}
