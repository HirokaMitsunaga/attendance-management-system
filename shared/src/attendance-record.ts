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
  workDate: WorkDateDto;
  punchEvents: PunchEventDto[];
};

const requiredField = (fieldName: string): string => `${fieldName}は必須です`;
const invalidFormat = (fieldName: string): string =>
  `${fieldName}の形式が正しくありません`;

const workDateDtoSchema = z
  .iso.date({ message: invalidFormat('勤務日') })
  .min(1, requiredField('勤務日'));

export type WorkDateDto = z.infer<typeof workDateDtoSchema>;

const workDateAsDateSchema = (fieldLabel: string) =>
  z
    .iso.date({ message: invalidFormat(fieldLabel) })
    .min(1, requiredField(fieldLabel))
    .transform((value, ctx) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
      ) {
        ctx.addIssue({ code: 'custom', message: invalidFormat(fieldLabel) });
        return z.NEVER;
      }
      return date;
    });

const occurredAtAsDateSchema = (fieldLabel: string) =>
  z
    .string()
    .min(1, requiredField(fieldLabel))
    .datetime({ message: invalidFormat(fieldLabel) })
    .transform((value, ctx) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        ctx.addIssue({ code: 'custom', message: invalidFormat(fieldLabel) });
        return z.NEVER;
      }
      return date;
    });

const occurredAtDtoSchema = z
  .string()
  .min(1, requiredField('打刻日時'))
  .datetime({ message: invalidFormat('打刻日時') });

export const clockInEventRequestBodySchema = z.object({
  userId: z
    .string()
    .min(1, requiredField('ユーザーID'))
    .ulid({ message: invalidFormat('ユーザーID') }),
  workDate: workDateDtoSchema,
  occurredAt: occurredAtDtoSchema,
});

export type ClockInEventRequestBodyDto = z.infer<
  typeof clockInEventRequestBodySchema
>;

export const clockInEventRequestSchema = z.object({
  userId: z
    .string()
    .min(1, requiredField('ユーザーID'))
    .ulid({ message: invalidFormat('ユーザーID') }),
  workDate: workDateAsDateSchema('勤務日'),
  occurredAt: occurredAtAsDateSchema('打刻日時'),
});

export type ClockInEventRequestDto = z.infer<typeof clockInEventRequestSchema>;

export const clockOutEventRequestBodySchema = clockInEventRequestBodySchema;
export type ClockOutEventRequestBodyDto = z.infer<
  typeof clockOutEventRequestBodySchema
>;

export const clockOutEventRequestSchema = z.object({
  userId: z
    .string()
    .min(1, requiredField('ユーザーID'))
    .ulid({ message: invalidFormat('ユーザーID') }),
  workDate: workDateAsDateSchema('勤務日'),
  occurredAt: occurredAtAsDateSchema('打刻日時'),
});

export type ClockOutEventRequestDto = z.infer<
  typeof clockOutEventRequestSchema
>;

export const breakStartEventRequestBodySchema = clockInEventRequestBodySchema;
export type BreakStartEventRequestBodyDto = z.infer<
  typeof breakStartEventRequestBodySchema
>;

export const breakStartEventRequestSchema = z.object({
  userId: z
    .string()
    .min(1, requiredField('ユーザーID'))
    .ulid({ message: invalidFormat('ユーザーID') }),
  workDate: workDateAsDateSchema('勤務日'),
  occurredAt: occurredAtAsDateSchema('打刻日時'),
});

export type BreakStartEventRequestDto = z.infer<
  typeof breakStartEventRequestSchema
>;

export const breakEndEventRequestBodySchema = clockInEventRequestBodySchema;
export type BreakEndEventRequestBodyDto = z.infer<
  typeof breakEndEventRequestBodySchema
>;

export const breakEndEventRequestSchema = z.object({
  userId: z
    .string()
    .min(1, requiredField('ユーザーID'))
    .ulid({ message: invalidFormat('ユーザーID') }),
  workDate: workDateAsDateSchema('勤務日'),
  occurredAt: occurredAtAsDateSchema('打刻日時'),
});

export type BreakEndEventRequestDto = z.infer<
  typeof breakEndEventRequestSchema
>;
