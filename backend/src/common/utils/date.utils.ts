/**
 * 日付関連のユーティリティ関数
 * すべての日付操作はこのユーティリティを使用すること
 */

/**
 * 現在の日時を取得（JST）
 */
export const getCurrentDate = (): Date => {
  return new Date();
};

/**
 * Date オブジェクトを JST の文字列にフォーマット
 * @param date フォーマットする日付
 * @returns JST の文字列（例: "2024/01/01 12:00:00"）
 */
export const formatDateToJST = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Date オブジェクトを ISO 8601 形式の文字列にフォーマット
 * @param date フォーマットする日付（省略時は現在日時）
 * @returns ISO 8601 形式の文字列（例: "2024-01-01"）
 */
export const formatDateToISOString = (date?: Date | string): string => {
  const dateObj = date
    ? typeof date === 'string'
      ? new Date(date)
      : date
    : getCurrentDate();
  return dateObj.toISOString().split('T')[0];
};

/**
 * ISO 8601 形式の文字列から Date オブジェクトを作成
 * @param dateString ISO 8601 形式の文字列（例: "2024-01-01"）
 * @returns Date オブジェクト
 */
export const parseISOString = (dateString: string): Date => {
  return new Date(dateString);
};
