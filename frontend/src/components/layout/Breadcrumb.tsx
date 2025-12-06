'use client';

import { CustomLink } from '@/components/ui';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <div
          key={`${item.label}-${item.href || 'current'}`}
          className="flex items-center gap-2"
        >
          {index > 0 && <span className="text-gray-400 font-medium">&gt;</span>}
          {item.href ? (
            <CustomLink
              href={item.href}
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              {item.label}
            </CustomLink>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};
