import type { UseFormSetError, Path } from 'react-hook-form';
import { ApiClientError } from './api-client';

export const extractErrorMessage = (
  error: unknown,
  defaultMessage: string,
): string => {
  const errorMessageExtractorMap: Record<string, (error: unknown) => string> = {
    ApiClientError: (err) => (err instanceof ApiClientError ? err.message : ''),
    Error: (err) => (err instanceof Error ? err.message : ''),
  };

  return (
    errorMessageExtractorMap.ApiClientError(error) ||
    errorMessageExtractorMap.Error(error) ||
    defaultMessage
  );
};

/**
 * フォーム送信時のエラーハンドリング
 * - サーバーからのバリデーションエラー（detailsあり）は各フィールドに設定
 * - それ以外のエラーは画面の上部に表示
 */
export const handleFormError = <T extends Record<string, unknown>>(
  err: unknown,
  setFormError: UseFormSetError<T>,
  setError: (message: string) => void,
  defaultErrorMessage: string,
): void => {
  if (err instanceof ApiClientError && err.details) {
    // サーバーからのバリデーションエラーを各フィールドに設定
    err.details.forEach((detail) => {
      const fieldName = detail.path[0] as Path<T>;
      if (fieldName) {
        setFormError(fieldName, {
          type: 'server',
          message: detail.message,
        });
      }
    });
  } else {
    // バリデーションエラー以外のエラーは画面の上部に表示
    const message = extractErrorMessage(err, defaultErrorMessage);
    setError(message);
  }
};
