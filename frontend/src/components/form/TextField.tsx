'use client';

import { Input } from '../ui';
import { FormField } from './FormField';
import { useFormContext, useFormState } from 'react-hook-form';

type TextFieldProps = {
  name: string;
  label?: string;
  rules?: Parameters<ReturnType<typeof useFormContext>['register']>[1];
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
  className?: string;
};

export const TextField = ({
  name,
  label,
  rules,
  placeholder,
  type = 'text',
  className,
}: TextFieldProps) => {
  const { register, control } = useFormContext();
  const { errors } = useFormState({ control });

  return (
    <FormField name={name} label={label} rules={rules}>
      <Input
        type={type}
        {...register(name, rules)}
        placeholder={placeholder}
        error={!!errors[name]}
        className={className}
      />
    </FormField>
  );
};
