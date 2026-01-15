import { z } from 'zod';
import { INVALID_FORMAT, REQUIRED_FIELD } from '../constants';
import { parseISOString } from './date.utils';

/**
 * JSON文字列からDateオブジェクトへの変換とバリデーションを行うZodスキーマ
 * 勤怠記録の日付フィールド（勤務日、打刻日時など）で共通利用
 *
 * @param fieldLabel - エラーメッセージに表示するフィールド名
 * @returns Zodスキーマ
 */
export const dateFromJsonSchema = (fieldLabel: string) =>
  z
    .preprocess(
      (value) => (typeof value === 'string' ? parseISOString(value) : value),
      z.date({
        error: (issue) =>
          issue.inst === undefined
            ? REQUIRED_FIELD(fieldLabel)
            : INVALID_FORMAT(fieldLabel),
      }),
    )
    .refine((date) => !Number.isNaN(date.getTime()), {
      message: INVALID_FORMAT(fieldLabel),
    });

/**
 * YYYY-MM-DD 形式のJSON文字列からDateオブジェクトへの変換とバリデーションを行うZodスキーマ
 * DBは DATE を想定し、UTCの0時に正規化する。
 */
export const workDateFromJsonSchema = (fieldLabel: string) =>
  z.iso
    .date({ message: INVALID_FORMAT(fieldLabel) })
    .min(1, REQUIRED_FIELD(fieldLabel))
    .transform((value, ctx) => {
      const date = parseISOString(`${value}T00:00:00.000Z`);
      if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
      ) {
        ctx.addIssue({ code: 'custom', message: INVALID_FORMAT(fieldLabel) });
        return z.NEVER;
      }
      return date;
    });
