'use client';

import { useState } from 'react';
import { Button } from './Button';
import { DownloadIcon } from '../icons';
import type { ButtonProps } from './Button';

type CsvExportButtonProps = Omit<ButtonProps, 'onClick'> & {
  onExport: () => Promise<void>;
};

export const CsvExportButton = ({
  onExport,
  children = 'CSV出力',
  disabled,
  ...buttonProps
}: CsvExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleClick = async () => {
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      {...buttonProps}
      onClick={handleClick}
      disabled={isExporting || disabled}
      isLoading={isExporting}
      icon={<DownloadIcon />}
      className={`bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 ${
        buttonProps.className || ''
      }`}
    >
      {children}
    </Button>
  );
};
