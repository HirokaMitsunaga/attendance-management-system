'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  children,
  disabled,
  icon,
  iconPosition = 'left',
  ...props
}: ButtonProps) => {
  const baseStyles =
    'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer inline-flex items-center justify-center gap-2';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline:
      'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const getIconSize = () => {
    if (size === 'sm') return 'w-4 h-4';
    if (size === 'lg') return 'w-6 h-6';
    return 'w-5 h-5';
  };

  const iconSize = getIconSize();

  const renderContent = () => {
    if (isLoading) {
      return <span>読み込み中...</span>;
    }

    if (!icon) {
      return children;
    }

    const iconElement = (
      <span className={`${iconSize} flex items-center justify-center shrink-0`}>
        {icon}
      </span>
    );

    if (iconPosition === 'right') {
      return (
        <>
          {children}
          {iconElement}
        </>
      );
    }

    return (
      <>
        {iconElement}
        {children}
      </>
    );
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {renderContent()}
    </button>
  );
};
