/**
 * SWRキー生成のユーティリティ関数
 */

/**
 * SWRのキー（URL）を生成する
 * @param endpoint - APIエンドポイント（例: '/users'）
 * @param params - クエリパラメータ（値がある場合のみ追加される）
 * @param requiredParams - 必須パラメータ（常に追加される）
 * @returns SWRのキー（URL文字列）
 * @note 呼び出し側でnullチェックが必要な場合は、buildSWRKeyの呼び出し前にチェックすること
 */
export const buildSWRKey = (
  endpoint: string,
  params?: Record<string, string | number | null | undefined>,
  requiredParams?: Record<string, string | number>,
): string => {
  const urlParams = new URLSearchParams();

  // 必須パラメータを追加
  if (requiredParams) {
    for (const [key, value] of Object.entries(requiredParams)) {
      if (value !== null && value !== undefined) {
        urlParams.set(key, String(value));
      }
    }
  }

  // オプショナルパラメータを追加（値がある場合のみ）
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== '') {
        urlParams.append(key, String(value));
      }
    }
  }

  const queryString = urlParams.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};
