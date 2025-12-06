'use client';

import { useEffect } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { UserManagement } from '@/features/user-management/components/list/UserManagement';

export default function AdminUserManagementPage() {
  const { setItems } = useBreadcrumb();
  usePageTitle('ユーザー管理');

  useEffect(() => {
    setItems([{ label: 'ホーム', href: '/' }, { label: 'ユーザー管理' }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <UserManagement />;
}

