const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  cache?: RequestCache;
};

export type ApiError = {
  statusCode: number;
  errorCode?: string;
  message: string;
  timestamp?: string;
  details?: Array<{
    path: (string | number)[];
    message: string;
  }>;
};

export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string | undefined,
    message: string,
    public details?: Array<{
      path: (string | number)[];
      message: string;
    }>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export const apiClient = async <T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> => {
  const { method = 'GET', headers = {}, body, cache } = options;

  // 開発用: 認証ヘッダーを追加
  // TODO: 実際の認証機能を実装したら、トークンから取得する
  const authHeaders: Record<string, string> = {
    Authorization: 'Bearer dev-token',
    'x-user-id': process.env.NEXT_PUBLIC_DEV_USER_ID || 'system',
  };

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
    cache,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      statusCode: response.status,
      message: 'リクエストに失敗しました',
    }));

    const statusCode = errorData.statusCode || response.status;
    const errorMessageMap: Record<number, string> = {
      500: '予期せぬエラーが発生しました',
    };

    const message =
      errorMessageMap[statusCode] ||
      errorData.message ||
      `HTTP error! status: ${statusCode}`;

    throw new ApiClientError(
      statusCode,
      errorData.errorCode,
      message,
      errorData.details,
    );
  }

  // 204 No Content や空のレスポンスの場合
  if (
    response.status === 204 ||
    response.headers.get('content-length') === '0'
  ) {
    return null as T;
  }

  // レスポンステキストを取得して、空の場合はnullを返す
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    return null as T;
  }

  // JSONパースを試みる
  try {
    return JSON.parse(text) as T;
  } catch {
    // JSONパースに失敗した場合はnullを返す
    return null as T;
  }
};
