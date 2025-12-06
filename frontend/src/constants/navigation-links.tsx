import type { ReactNode } from 'react';
import type { UserRole } from '@/types/user';
import { UserManagementIcon } from '@/components/ui/icons';

export type NavigationLink = {
  href: string;
  label: string;
  description: string;
  requiredRole: UserRole;
  icon?: ReactNode; // オプショナル: サイドメニュー用
};

// ダッシュボードとナビゲーションメニュー用のリンク（説明付き）
// 要件に合わせて、ユーザー管理（admin専用）のみを表示
export const navigationLinks: NavigationLink[] = [
  {
    href: '/admin/user-management',
    label: 'ユーザー管理',
    description: 'ユーザーの追加・編集を行います',
    requiredRole: 'admin',
    icon: <UserManagementIcon />,
  },
];

export const roleCategoryMap: Record<
  UserRole,
  { title: string; description: string }
> = {
  user: {
    title: '一般機能',
    description: '一般ユーザーが利用できる機能',
  },
  admin: {
    title: '管理機能',
    description: '管理者が利用できる機能',
  },
};
