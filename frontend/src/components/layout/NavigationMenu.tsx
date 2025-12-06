'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { navigationLinks, roleCategoryMap } from '@/constants/navigation-links';
import type { UserRole } from '@/types/user';

export const NavigationMenu = () => {
  const { hasRole } = useAuth();
  const pathname = usePathname();
  const [hoveredRole, setHoveredRole] = useState<UserRole | null>(null);

  // 各権限区分に属するリンクを取得（その権限区分で直接アクセス可能なもの）
  const getLinksForRole = (role: UserRole): typeof navigationLinks => {
    return navigationLinks.filter(
      (link) => link.requiredRole === role && hasRole(link.requiredRole),
    );
  };

  // 表示する権限区分を決定（ユーザーの権限に応じて表示）
  const visibleRoles: UserRole[] = [];
  const userLinks = getLinksForRole('user');
  const adminLinks = getLinksForRole('admin');

  if (hasRole('user') && userLinks.length > 0) visibleRoles.push('user');
  if (hasRole('admin') && adminLinks.length > 0) visibleRoles.push('admin');

  return (
    <nav className="flex items-center px-4">
      {visibleRoles.map((role, index) => {
        const category = roleCategoryMap[role];
        const links = getLinksForRole(role);
        const isHovered = hoveredRole === role;
        const isLast = index === visibleRoles.length - 1;

        return (
          <div
            key={role}
            className="relative flex items-center"
            onMouseEnter={() => setHoveredRole(role)}
            onMouseLeave={() => setHoveredRole(null)}
          >
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-300 transition-colors cursor-pointer"
              type="button"
            >
              {category.title}
            </button>
            {!isLast && <div className="h-6 w-px bg-gray-400 mx-1" />}

            {isHovered && links.length > 0 && (
              <div className="absolute top-full left-0 mt-0 w-72 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200 mb-1">
                    {category.title}
                  </div>
                  {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {link.icon && (
                            <div
                              className={`shrink-0 ${
                                isActive ? 'text-blue-600' : 'text-gray-600'
                              }`}
                            >
                              {link.icon}
                            </div>
                          )}
                          <div className="flex-1">
                            <div
                              className={`font-medium ${
                                isActive ? 'text-blue-900' : 'text-gray-900'
                              }`}
                            >
                              {link.label}
                            </div>
                            <div
                              className={`text-xs mt-0.5 ${
                                isActive ? 'text-blue-600' : 'text-gray-500'
                              }`}
                            >
                              {link.description}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};
