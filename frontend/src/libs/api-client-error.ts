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
    public rawBody?: string, // デバッグ用（任意）
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}
