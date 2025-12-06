'use client';

import { createContext, useContext, useState, useMemo } from 'react';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbContextType = {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined,
);

export const BreadcrumbProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [items, setItems] = useState<BreadcrumbItem[]>([
    { label: 'ホーム', href: '/' },
  ]);

  const value = useMemo(
    () => ({
      items,
      setItems,
    }),
    [items],
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
};
