import { z } from 'zod';
import { INVALID_FORMAT, REQUIRED_FIELD } from '../../common/constants';
import { parseISOString } from '../../common/utils/date.utils';

const dateFromJsonSchema = (fieldLabel: string) =>
  z
    .preprocess(
      (value) => (typeof value === 'string' ? parseISOString(value) : value),
      z.date({
        required_error: REQUIRED_FIELD(fieldLabel),
        invalid_type_error: INVALID_FORMAT(fieldLabel),
      }),
    )
    .refine((date) => !Number.isNaN(date.getTime()), {
      message: INVALID_FORMAT(fieldLabel),
    });

export const clockInEventRequestSchema = z.object({
  userId: z
    .string()
    .min(1, REQUIRED_FIELD('ユーザーID'))
    .ulid({ message: INVALID_FORMAT('ユーザーID') }),
  workDate: dateFromJsonSchema('勤務日'),
  occurredAt: dateFromJsonSchema('打刻日時'),
});

export type ClockInEventRequestDto = z.infer<typeof clockInEventRequestSchema>;
