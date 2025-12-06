import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { VALIDATION_MESSAGES } from '../../common/constants/validation';

export const createSearchConditionRequestSchema = z.object({
  formType: z.string().min(1, VALIDATION_MESSAGES.REQUIRED.FORM_TYPE),
  name: z.string().min(1, VALIDATION_MESSAGES.REQUIRED.NAME),
  urlParams: z.string().min(1, VALIDATION_MESSAGES.REQUIRED.URL_PARAMS),
});

export class CreateSearchConditionRequestDto {
  @ApiProperty({
    description: 'フォームタイプ',
    example: 'user-management',
    required: true,
  })
  formType: string;

  @ApiProperty({
    description: '検索条件名',
    example: '管理者ユーザー',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'URLパラメータ',
    example: 'role=admin&page=1',
    required: true,
  })
  urlParams: string;
}
