import { z } from 'zod';
import { REQUIRED_FIELD } from '../../common/constants';
import { dateFromJsonSchema } from '../../common/utils/zod-helpers';

export const attendanceCorrectionRequestSchema = z.object({
  workDate: dateFromJsonSchema('勤務日'),
  occurredAt: dateFromJsonSchema('打刻日時'),
  reason: z.string().min(1, REQUIRED_FIELD('理由')),
});

export type AttendanceCorrectionRequestDto = z.infer<
  typeof attendanceCorrectionRequestSchema
>;
