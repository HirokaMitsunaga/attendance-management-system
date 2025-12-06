/**
 * リソース未検出エラーメッセージの定数定義
 */

export const getResourceNotFound = (
  resource: string,
  identifier?: string | number,
): string =>
  identifier !== undefined
    ? `${resource}（識別子: "${identifier}"）が見つかりません`
    : `${resource}が見つかりません`;
