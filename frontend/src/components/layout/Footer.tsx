'use client';

import { themeColors } from '@/constants/theme';

export const Footer = () => {
  const backgroundColor = themeColors.primary;

  return (
    <footer
      className="w-full border-t mt-auto"
      style={{
        backgroundColor,
        color: '#ffffff',
      }}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm">
          <p>© 2025 Sample App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
