'use client';

import { useFormContext, useFormState } from 'react-hook-form';

type FormFieldProps = {
  name: string;
  label?: string;
  children?: React.ReactNode;
  rules?: Parameters<ReturnType<typeof useFormContext>['register']>[1];
};

export const FormField = ({ name, label, children, rules }: FormFieldProps) => {
  const { control } = useFormContext();
  const { errors } = useFormState({ control });

  const fieldError = errors[name];
  const errorMessage =
    typeof fieldError?.message === 'string' ? fieldError.message : undefined;

  // 必須項目かどうかを判定（rulesにrequiredがある場合）
  const isRequired =
    rules &&
    typeof rules === 'object' &&
    'required' in rules &&
    (rules.required === true || typeof rules.required === 'string');

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="font-medium text-sm text-gray-700">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {children}

      {errorMessage && (
        <p className="text-red-500 text-xs" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
