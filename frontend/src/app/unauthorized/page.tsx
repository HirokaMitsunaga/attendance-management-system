'use client';

import { CustomLink } from '@/components/ui';
import { Button, PageContainer } from '@/components/ui';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function Unauthorized() {
  usePageTitle('アクセス権限がありません');

  return (
    <PageContainer className="flex items-center justify-center">
      <div className="text-center w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-8xl font-bold text-orange-500 mb-4">403</h1>
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            アクセス権限がありません
          </h2>
        </div>

        <div className="mb-8">
          <p className="text-lg text-gray-600">
            このページにアクセスするには、適切な権限が必要です。
            <br />
            管理者にお問い合わせください。
          </p>
        </div>

        <div className="flex flex-col gap-3 items-center">
          <CustomLink href="/" className="w-full max-w-xs">
            <Button variant="primary" className="w-full">
              ホームに戻る
            </Button>
          </CustomLink>
        </div>
      </div>
    </PageContainer>
  );
}

