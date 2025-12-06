'use client';

import { Input } from '../ui';
import { FormField } from './FormField';
import { useFormContext, useFormState } from 'react-hook-form';

type DateTimeFieldProps = {
  name: string;
  label?: string;
  rules?: Parameters<ReturnType<typeof useFormContext>['register']>[1];
  placeholder?: string;
  className?: string;
};

export const DateTimeField = ({
  name,
  label,
  rules,
  placeholder,
  className,
}: DateTimeFieldProps) => {
  const { register, control } = useFormContext();
  const { errors } = useFormState({ control });

  return (
    <FormField name={name} label={label} rules={rules}>
      <Input
        type="datetime-local"
        {...register(name, rules)}
        placeholder={placeholder}
        error={!!errors[name]}
        className={className}
      />
    </FormField>
  );
};
