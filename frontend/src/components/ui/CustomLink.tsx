'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type LinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  visited?: boolean;
  'aria-label'?: string;
  onClick?: () => void;
};

export const CustomLink = ({
  href,
  children,
  className = '',
  visited = false,
  'aria-label': ariaLabel,
  onClick,
}: LinkProps) => {
  const pathname = usePathname();
  const isVisited = useMemo(() => {
    if (visited) return true;
    // 現在のパスとhrefが一致する場合はvisitedとみなす
    return pathname === href;
  }, [pathname, href, visited]);

  const baseStyles =
    'text-blue-300 hover:text-blue-100 underline transition-colors';
  const visitedStyles = isVisited
    ? 'visited:text-purple-300 visited:hover:text-purple-100'
    : '';

  return (
    <NextLink
      href={href}
      className={`${baseStyles} ${visitedStyles} ${className}`}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </NextLink>
  );
};
