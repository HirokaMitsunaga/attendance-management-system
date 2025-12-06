'use client';

import { useMemo } from 'react';
import { CustomLink } from '@/components/ui';

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
} as const;

const arrowStyles = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-b-transparent',
  bottom:
    'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-r-transparent',
  right:
    'right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-l-transparent',
} as const;

type HelpTooltipProps = {
  message: string;
  linkText?: string;
  linkHref?: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
};

export const HelpTooltip = ({
  message,
  linkText,
  linkHref,
  children,
  position = 'bottom',
}: HelpTooltipProps) => {
  const tooltipContent = useMemo(
    () => (
      <div
        className={`hidden group-hover:block absolute ${positionStyles[position]} w-64 z-50`}
      >
        <div
          className={`absolute ${arrowStyles[position]} border-4 border-transparent`}
        ></div>
        <div className="bg-gray-800 text-white text-xs p-3 rounded shadow-lg text-left leading-relaxed whitespace-pre-line">
          {message}
          {linkText && linkHref && (
            <div className="mt-1">
              <CustomLink href={linkHref}>{linkText}</CustomLink>
            </div>
          )}
        </div>
      </div>
    ),
    [message, linkText, linkHref, position],
  );

  return (
    <div className="group relative inline-block">
      {children}
      {tooltipContent}
    </div>
  );
};
