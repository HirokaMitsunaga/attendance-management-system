import { z } from 'zod';
import { INVALID_FORMAT, REQUIRED_FIELD } from '../constants';
import { parseISOString } from './date.utils';

const isMissingValue = (value: unknown): boolean =>
  value === undefined || value === null || value === '';

/**
 * JSON文字列からDateオブジェクトへの変換とバリデーションを行うZodスキーマ
 * 勤怠記録の日付フィールド（勤務日、打刻日時など）で共通利用
 *
 * @param fieldLabel - エラーメッセージに表示するフィールド名
 * @returns Zodスキーマ
 */
export const dateFromJsonSchema = (fieldLabel: string) =>
  z.unknown().transform((value, ctx) => {
    if (isMissingValue(value)) {
      ctx.addIssue({ code: 'custom', message: REQUIRED_FIELD(fieldLabel) });
      return z.NEVER;
    }

    const date = typeof value === 'string' ? parseISOString(value) : value;
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: 'custom', message: INVALID_FORMAT(fieldLabel) });
      return z.NEVER;
    }

    return date;
  });

/**
 * YYYY-MM-DD 形式のJSON文字列からDateオブジェクトへの変換とバリデーションを行うZodスキーマ
 * DBは DATE を想定し、UTCの0時に正規化する。
 */
export const workDateFromJsonSchema = (fieldLabel: string) =>
  z.unknown().transform((value, ctx) => {
    if (isMissingValue(value)) {
      ctx.addIssue({ code: 'custom', message: REQUIRED_FIELD(fieldLabel) });
      return z.NEVER;
    }

    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      ctx.addIssue({ code: 'custom', message: INVALID_FORMAT(fieldLabel) });
      return z.NEVER;
    }

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
