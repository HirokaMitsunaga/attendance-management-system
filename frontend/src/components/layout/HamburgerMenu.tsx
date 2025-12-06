'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MenuIcon, CloseIcon } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { navigationLinks, roleCategoryMap } from '@/constants/navigation-links';
import type { UserRole } from '@/types/user';

export const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { hasRole } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const visibleMenuItems = navigationLinks.filter((item) =>
    hasRole(item.requiredRole),
  );

  const menuItemsByRole = visibleMenuItems.reduce(
    (acc, item) => {
      if (!acc[item.requiredRole]) {
        acc[item.requiredRole] = [];
      }
      acc[item.requiredRole].push(item);
      return acc;
    },
    {} as Record<UserRole, typeof navigationLinks>,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white hover:opacity-80 transition-opacity cursor-pointer hover:bg-gray-300 rounded-md"
        aria-label="メニューを開く"
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-gray-200/60 z-90"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <nav className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-100 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  メニュー
                </h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                  aria-label="メニューを閉じる"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ul className="py-4">
                  {(Object.keys(menuItemsByRole) as UserRole[]).map((role) => (
                    <li key={role}>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {roleCategoryMap[role].title}
                      </div>
                      {menuItemsByRole[role].map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={handleLinkClick}
                            className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                              isActive
                                ? 'bg-blue-100 text-blue-700 font-semibold'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {item.icon && (
                              <span
                                className={
                                  isActive ? 'text-blue-600' : 'text-gray-600'
                                }
                              >
                                {item.icon}
                              </span>
                            )}
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
};
