import { z } from 'zod';

export const ATTENDANCE_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  WORKING: 'WORKING',
  BREAKING: 'BREAKING',
  FINISHED: 'FINISHED',
} as const;

export type AttendanceStatus =
  (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

export const PUNCH_TYPE = {
  CLOCK_IN: 'CLOCK_IN',
  CLOCK_OUT: 'CLOCK_OUT',
  BREAK_START: 'BREAK_START',
  BREAK_END: 'BREAK_END',
} as const;

export type PunchType = (typeof PUNCH_TYPE)[keyof typeof PUNCH_TYPE];

export const PUNCH_SOURCE = {
  NORMAL: 'NORMAL',
  CORRECTION: 'CORRECTION',
} as const;

export type PunchSource = (typeof PUNCH_SOURCE)[keyof typeof PUNCH_SOURCE];

export type PunchEventDto = {
  punchType: PunchType;
  occurredAt: string;
  source: PunchSource;
  sourceId?: string | null;
};

export type AttendanceRecordDto = {
  id: string;
  userId: string;
  workDate: string;
  punchEvents: PunchEventDto[];
};

const requiredField = (fieldName: string): string => `${fieldName}は必須です`;
const invalidFormat = (fieldName: string): string =>
  `${fieldName}の形式が正しくありません`;

const parseDateFromString = (value: string): Date | null => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const dateFromJsonSchema = (fieldLabel: string) =>
  z
    .string()
    .min(1, requiredField(fieldLabel))
    .transform((value, ctx) => {
      const date = parseDateFromString(value);
      if (!date) {
        ctx.addIssue({ code: 'custom', message: invalidFormat(fieldLabel) });
        return z.NEVER;
      }
      return date;
    });

export const clockInEventRequestSchema = z.object({
  userId: z
    .string()
    .min(1, requiredField('ユーザーID'))
    .ulid({ message: invalidFormat('ユーザーID') }),
  workDate: dateFromJsonSchema('勤務日'),
  occurredAt: dateFromJsonSchema('打刻日時'),
});

export type ClockInEventRequestDto = z.infer<typeof clockInEventRequestSchema>;

export const clockOutEventRequestSchema = z.object({
  userId: z
    .string()
    .min(1, requiredField('ユーザーID'))
    .ulid({ message: invalidFormat('ユーザーID') }),
  workDate: dateFromJsonSchema('勤務日'),
  occurredAt: dateFromJsonSchema('打刻日時'),
});

export type ClockOutEventRequestDto = z.infer<
  typeof clockOutEventRequestSchema
>;

export const breakStartEventRequestSchema = z.object({
  userId: z
    .string()
    .min(1, requiredField('ユーザーID'))
    .ulid({ message: invalidFormat('ユーザーID') }),
  workDate: dateFromJsonSchema('勤務日'),
  occurredAt: dateFromJsonSchema('打刻日時'),
});

export type BreakStartEventRequestDto = z.infer<
  typeof breakStartEventRequestSchema
>;

export const breakEndEventRequestSchema = z.object({
  userId: z
    .string()
    .min(1, requiredField('ユーザーID'))
    .ulid({ message: invalidFormat('ユーザーID') }),
  workDate: dateFromJsonSchema('勤務日'),
  occurredAt: dateFromJsonSchema('打刻日時'),
});

export type BreakEndEventRequestDto = z.infer<typeof breakEndEventRequestSchema>;
