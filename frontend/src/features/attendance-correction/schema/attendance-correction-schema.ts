import { z } from 'zod';
import { ATTENDANCE_CORRECTION_TYPE } from '../types/attendance-correction-type';

export const AttendanceCorrectionSchema = z.object({
  date: z.iso.date({ message: '日付の形式が不正です。' }),
  correctionType: z.enum(
    [
      ATTENDANCE_CORRECTION_TYPE.CLOCK_IN.value,
      ATTENDANCE_CORRECTION_TYPE.CLOCK_OUT.value,
    ],
    {
      message: '修正項目は必須です',
    },
  ),
  time: z.iso.time({
    precision: -1,
    message: '時刻の形式が不正です',
  }),
  reason: z
    .string()
    .min(1, '理由は必須です')
    .max(500, '理由は500文字以内で入力してください'),
});

export type AttendanceCorrectionFormData = z.infer<
  typeof AttendanceCorrectionSchema
>;
