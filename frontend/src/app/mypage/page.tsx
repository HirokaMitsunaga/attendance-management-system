'use client';

import { useEffect } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { MyPageContent } from '@/features/mypage/components/MyPageContent';

export default function MyPage() {
  const { setItems } = useBreadcrumb();
  usePageTitle('マイページ');

  useEffect(() => {
    setItems([
      { label: 'ホーム', href: '/' },
      { label: 'マイページ' },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <MyPageContent />;
}

