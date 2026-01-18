import { ApiError, ApiClientError } from './api-client-error';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  cache?: RequestCache;
};

const isJsonResponse = (res: Response) =>
  (res.headers.get('content-type') || '').includes('application/json');

export const apiClient = async <T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> => {
  const { method = 'GET', headers = {}, body, cache } = options;

  const isDev = process.env.NODE_ENV !== 'production';

  const authHeaders: Record<string, string> = isDev
    ? {
        Authorization: 'Bearer dev-token',
        'x-user-id': process.env.NEXT_PUBLIC_DEV_USER_ID || 'system',
      }
    : {};

  const config: RequestInit = {
    method,
    headers: {
      ...authHeaders,
      ...headers,
      // JSONを送るときだけ付ける（FormData等に拡張しやすい）
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    cache,
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // 204は成功として void/null を返す
  if (response.status === 204) return null as T;

  const rawText = await response.text(); // 先に取っておく（失敗時も成功時も使える）

  if (!response.ok) {
    // JSONならApiErrorに寄せる。違うならrawTextも残す。
    let errorData: Partial<ApiError> = {};
    if (rawText && isJsonResponse(response)) {
      try {
        errorData = JSON.parse(rawText);
      } catch {
        // ignore
      }
    }

    const statusCode = (errorData.statusCode as number) || response.status;
    const message =
      (errorData.message as string) ||
      (statusCode === 500
        ? '予期せぬエラーが発生しました'
        : `HTTP error! status: ${statusCode}`);

    throw new ApiClientError(
      statusCode,
      errorData.errorCode as string | undefined,
      message,
      errorData.details as ApiError['details'],
      rawText || undefined,
    );
  }

  // 空なら null
  if (!rawText || rawText.trim().length === 0) return null as T;

  // JSONレスポンスならJSONとして返す。JSONなのに壊れてたら落として気づく。
  if (isJsonResponse(response)) {
    return JSON.parse(rawText) as T;
  }

  // JSONじゃないレスポンスをTにするのは危険だが、必要ならここで string を返す設計に寄せる
  // 例: return rawText as unknown as T;
  return null as T;
};
