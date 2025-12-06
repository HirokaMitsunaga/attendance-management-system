'use client';

import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { themeColors } from '@/constants/theme';
import { Breadcrumb } from './Breadcrumb';
import { HamburgerMenu } from './HamburgerMenu';
import { NavigationMenu } from './NavigationMenu';
import { HeaderLogo } from './HeaderLogo';
import { UserProfile } from './UserProfile';

export const Header = () => {
  const { items: breadcrumbItems } = useBreadcrumb();

  const backgroundColor = themeColors.primary;

  return (
    <>
      <header
        className=" z-50 w-full"
        style={{
          backgroundColor,
          color: '#ffffff',
        }}
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <HamburgerMenu />
              <HeaderLogo />
            </div>

            <div className="flex items-center gap-6">
              <UserProfile />
            </div>
          </div>
        </div>
      </header>
      <div className="sticky z-40 top-0 w-full bg-gray-100 border-b border-gray-300">
        <div className="container mx-auto px-4  flex items-center justify-between">
          <NavigationMenu />
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>
    </>
  );
};
