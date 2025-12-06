'use client';

import { useEffect } from 'react';
import { CustomLink } from '@/components/ui';
import { Button, PageContainer } from '@/components/ui';

type ErrorPageProps = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  const isApiError = error.name === 'ApiClientError';
  const statusCode = isApiError
    ? (error as { statusCode?: number }).statusCode
    : 500;
  const errorMessage = error.message || '予期しないエラーが発生しました。';

  return (
    <PageContainer className="flex items-center justify-center">
      <div className="text-center w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-8xl font-bold text-red-500 mb-4">{statusCode}</h1>
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            サーバーエラー
          </h2>
        </div>

        <div className="mb-8">
          <p className="text-lg text-gray-600 mb-2">{errorMessage}</p>
          {error.digest && (
            <p className="text-sm text-gray-500">エラーID: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 items-center">
          <Button onClick={reset} variant="primary" className="w-full max-w-xs">
            もう一度試す
          </Button>
          <CustomLink href="/" className="w-full max-w-xs">
            <Button variant="outline" className="w-full">
              ホームに戻る
            </Button>
          </CustomLink>
        </div>
      </div>
    </PageContainer>
  );
}
