import { z } from 'zod';
import { INVALID_FORMAT, REQUIRED_FIELD } from '../../common/constants';

// RuleTargetActionの定義
const ruleTargetActionSchema = z.enum([
  'CLOCK_IN',
  'CLOCK_OUT',
  'BREAK_START',
  'BREAK_END',
]);

// RuleTypeの定義
const ruleTypeSchema = z.enum([
  'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
  'ALLOW_CLOCK_OUT_ONLY_AFTER_TIME',
]);

// RuleSettingの定義
const ruleSettingSchema = z.union([
  z.object({
    type: z.literal('ALLOW_CLOCK_IN_ONLY_BEFORE_TIME'),
    latestClockInTime: z
      .string()
      .min(1, REQUIRED_FIELD('最遅出勤時刻'))
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, INVALID_FORMAT('最遅出勤時刻')),
  }),
  z.object({
    type: z.literal('ALLOW_CLOCK_OUT_ONLY_AFTER_TIME'),
    earliestClockOutTime: z
      .string()
      .min(1, REQUIRED_FIELD('最早退勤時刻'))
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, INVALID_FORMAT('最早退勤時刻')),
  }),
]);

// 作成リクエストスキーマ
export const createAttendanceRuleRequestSchema = z.object({
  targets: z
    .array(ruleTargetActionSchema)
    .min(1, REQUIRED_FIELD('対象アクション')),
  type: ruleTypeSchema,
  setting: ruleSettingSchema,
  enabled: z.boolean().default(true),
});

export type CreateAttendanceRuleRequestDto = z.infer<
  typeof createAttendanceRuleRequestSchema
>;

// 更新リクエストスキーマ
export const updateAttendanceRuleRequestSchema = z.object({
  targets: z
    .array(ruleTargetActionSchema)
    .min(1, REQUIRED_FIELD('対象アクション')),
  type: ruleTypeSchema,
  setting: ruleSettingSchema,
  enabled: z.boolean(),
});

export type UpdateAttendanceRuleRequestDto = z.infer<
  typeof updateAttendanceRuleRequestSchema
>;
