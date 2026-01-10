import { z } from 'zod';
import { INVALID_FORMAT, REQUIRED_FIELD } from '../../common/constants';
import { dateFromJsonSchema } from '../../common/utils/zod-helpers';

export const breakStartEventRequestSchema = z.object({
  userId: z
    .string()
    .min(1, REQUIRED_FIELD('ユーザーID'))
    .ulid({ message: INVALID_FORMAT('ユーザーID') }),
  workDate: dateFromJsonSchema('勤務日'),
  occurredAt: dateFromJsonSchema('打刻日時'),
});

export type BreakStartEventRequestDto = z.infer<
  typeof breakStartEventRequestSchema
>;
