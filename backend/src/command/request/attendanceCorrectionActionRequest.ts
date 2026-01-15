import { z } from 'zod';
import { INVALID_FORMAT, REQUIRED_FIELD } from '../../common/constants';
import { workDateFromJsonSchema } from '../../common/utils/zod-helpers';

export const approveAttendanceCorrectionRequestSchema = z.object({
  userId: z
    .string()
    .min(1, REQUIRED_FIELD('ユーザーID'))
    .ulid({ message: INVALID_FORMAT('ユーザーID') }),
  workDate: workDateFromJsonSchema('勤務日'),
});

export type ApproveAttendanceCorrectionRequestDto = z.infer<
  typeof approveAttendanceCorrectionRequestSchema
>;

export const rejectAttendanceCorrectionRequestSchema =
  approveAttendanceCorrectionRequestSchema.extend({
    comment: z.string().optional().nullable(),
  });

export type RejectAttendanceCorrectionRequestDto = z.infer<
  typeof rejectAttendanceCorrectionRequestSchema
>;

export const cancelAttendanceCorrectionRequestSchema =
  approveAttendanceCorrectionRequestSchema;

export type CancelAttendanceCorrectionRequestDto = z.infer<
  typeof cancelAttendanceCorrectionRequestSchema
>;
