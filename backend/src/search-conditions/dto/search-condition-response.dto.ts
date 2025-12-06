import { ApiProperty } from '@nestjs/swagger';
import type { SearchConditionEntity } from '../entities/search-condition.entity';

export class SearchConditionResponseDto {
  @ApiProperty({ description: '検索条件ID', example: '01HZ1234567890ABCDEF' })
  id!: string;

  @ApiProperty({ description: 'フォームタイプ', example: 'user-management' })
  formType!: string;

  @ApiProperty({ description: '検索条件名', example: '管理者ユーザー' })
  name!: string;

  @ApiProperty({
    description: 'URLパラメータ',
    example: 'role=admin&page=1',
  })
  urlParams!: string;

  @ApiProperty({
    description: '作成日時',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: '更新日時',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt!: string;

  static fromEntity(entity: SearchConditionEntity): SearchConditionResponseDto {
    const dto = new SearchConditionResponseDto();
    dto.id = entity.id;
    dto.formType = entity.formType;
    dto.name = entity.name;
    dto.urlParams = entity.urlParams;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
