'use client';

import { useRef, useState } from 'react';
import { Button } from './Button';
import { UploadIcon } from '../icons';
import type { ButtonProps } from './Button';

type CsvUploadButtonProps = Omit<ButtonProps, 'onClick'> & {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
};

export const CsvUploadButton = ({
  onUpload,
  accept = '.csv',
  children = 'CSVアップロード',
  disabled,
  ...buttonProps
}: CsvUploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await onUpload(file);
    } catch (error) {
      console.error('CSVアップロードエラー:', error);
      throw error;
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        {...buttonProps}
        onClick={handleClick}
        disabled={isUploading || disabled}
        isLoading={isUploading}
        icon={<UploadIcon />}
        className={`${
          buttonProps.className ||
          'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
        }`}
      >
        {children}
      </Button>
    </>
  );
};
