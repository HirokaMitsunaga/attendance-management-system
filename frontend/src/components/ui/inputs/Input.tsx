'use client';

import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full px-3 py-2 rounded-md border outline-none
          ${error ? 'border-red-500' : 'border-gray-300'}
          focus:ring-2 focus:ring-blue-500
          ${className}
        `}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
