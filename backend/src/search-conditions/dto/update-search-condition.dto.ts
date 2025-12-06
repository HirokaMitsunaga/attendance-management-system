import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { VALIDATION_MESSAGES } from '../../common/constants/validation';

export const updateSearchConditionRequestSchema = z.object({
  name: z.string().min(1, VALIDATION_MESSAGES.REQUIRED.NAME),
});

export class UpdateSearchConditionRequestDto {
  @ApiProperty({
    description: '検索条件名',
    example: '管理者ユーザー',
    required: true,
  })
  name: string;
}
