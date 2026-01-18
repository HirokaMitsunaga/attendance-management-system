import { z } from 'zod';
import { INVALID_FORMAT, REQUIRED_FIELD } from '../../common/constants';
import { workDateFromJsonSchema } from '../../common/utils/zod-helpers';

export const getEventRequestSchema = z.object({
  userId: z
    .string()
    .min(1, REQUIRED_FIELD('ユーザーID'))
    .ulid({ message: INVALID_FORMAT('ユーザーID') }),
  workDate: workDateFromJsonSchema('勤務日'),
});

export type GetEventRequestDto = z.infer<typeof getEventRequestSchema>;
