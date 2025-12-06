'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Title, PageContainer } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { navigationLinks, roleCategoryMap } from '@/constants/navigation-links';
import type { UserRole } from '@/types/user';

type CategorySection = {
  title: string;
  requiredRole: UserRole;
  links: typeof navigationLinks;
};

export const Dashboard = () => {
  const { hasRole } = useAuth();

  const userLinks = useMemo(
    () =>
      navigationLinks.filter(
        (link) => link.requiredRole === 'user' && hasRole(link.requiredRole),
      ),
    [hasRole],
  );
  const adminLinks = useMemo(
    () =>
      navigationLinks.filter(
        (link) => link.requiredRole === 'admin' && hasRole(link.requiredRole),
      ),
    [hasRole],
  );

  const categorySections: CategorySection[] = useMemo(
    () =>
      [
        {
          title: roleCategoryMap.user.title,
          requiredRole: 'user' as UserRole,
          links: userLinks,
        },
        {
          title: roleCategoryMap.admin.title,
          requiredRole: 'admin' as UserRole,
          links: adminLinks,
        },
      ].filter((section) => section.links.length > 0),
    [userLinks, adminLinks],
  );

  return (
    <PageContainer>
      <Title>ダッシュボード</Title>

      <div className="space-y-8">
        {categorySections.map((section) => (
          <div
            key={section.requiredRole}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {section.title}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block p-6 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {link.icon && (
                      <div className="shrink-0 text-gray-600">{link.icon}</div>
                    )}
                    <h3 className="text-lg font-medium text-gray-900">
                      {link.label}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
        {categorySections.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-center text-gray-500 py-8">
              表示できるリンクがありません
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
