import useSWR, { type SWRConfiguration } from 'swr';
import { apiClient } from './api-client';

/**
 * SWR用の共通fetcher関数
 * apiClientを使用してデータを取得する
 */
export const swrFetcher = async <T>(url: string): Promise<T> => {
  return apiClient<T>(url);
};

/**
 * SWRの共通設定
 */
export const defaultSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false, // フォーカス時の再検証を無効化
  revalidateOnReconnect: true, // 再接続時の再検証を有効化
  keepPreviousData: true, // ページネーション時のチラつき防止（新しいデータが来るまで前のデータを表示）
};

/**
 * SWRを使ったデータ取得の共通フック
 * @param key - SWRのキー（URLパラメータを含むエンドポイント）
 * @param config - SWRの設定（オプション）
 * @returns SWRの戻り値（data, error, isLoading, mutate等）
 */
export const useSWRData = <T>(
  key: string | null,
  config?: SWRConfiguration,
) => {
  return useSWR<T>(key, swrFetcher<T>, {
    ...defaultSWRConfig,
    ...config,
  });
};
