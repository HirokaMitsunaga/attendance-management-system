'use client';

import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="flex items-center">
          <input
            ref={ref}
            type="checkbox"
            className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
              error ? 'border-red-500' : ''
            } ${className}`}
            {...props}
          />
          {label && (
            <label
              htmlFor={props.id}
              className="ml-2 text-sm font-medium text-gray-700"
            >
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
