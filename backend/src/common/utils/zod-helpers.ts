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
