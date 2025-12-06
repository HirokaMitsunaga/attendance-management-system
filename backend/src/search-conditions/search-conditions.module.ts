import { Module } from '@nestjs/common';
import { SearchConditionsController } from './search-conditions.controller';
import { SearchConditionsRepository } from './infrastructure/search-conditions.repository';
import { FindAllSearchConditionsUseCase } from './use-cases/find-all-search-conditions.use-case';
import { CreateSearchConditionUseCase } from './use-cases/create-search-condition.use-case';
import { UpdateSearchConditionUseCase } from './use-cases/update-search-condition.use-case';
import { DeleteSearchConditionUseCase } from './use-cases/delete-search-condition.use-case';

@Module({
  controllers: [SearchConditionsController],
  providers: [
    SearchConditionsRepository,
    FindAllSearchConditionsUseCase,
    CreateSearchConditionUseCase,
    UpdateSearchConditionUseCase,
    DeleteSearchConditionUseCase,
  ],
})
export class SearchConditionsModule {}
