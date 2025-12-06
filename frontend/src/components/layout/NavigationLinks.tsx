'use client';

import { CustomLink } from '@/components/ui';
import { usePathname } from 'next/navigation';

type NavigationLink = {
  label: string;
  href: string;
};

type NavigationLinksProps = {
  links: NavigationLink[];
};

export const NavigationLinks = ({ links }: NavigationLinksProps) => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <CustomLink
            key={link.href}
            href={link.href}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors border ${
              isActive
                ? 'bg-blue-100 text-blue-700 border-blue-300 font-semibold'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            {link.label}
          </CustomLink>
        );
      })}
    </nav>
  );
};
