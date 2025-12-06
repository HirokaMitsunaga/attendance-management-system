'use client';

import { Input } from '../ui';
import { FormField } from './FormField';
import { useFormContext, useFormState } from 'react-hook-form';

type TimeFieldProps = {
  name: string;
  label?: string;
  rules?: Parameters<ReturnType<typeof useFormContext>['register']>[1];
  placeholder?: string;
  className?: string;
};

export const TimeField = ({
  name,
  label,
  rules,
  placeholder,
  className,
}: TimeFieldProps) => {
  const { register, control } = useFormContext();
  const { errors } = useFormState({ control });

  return (
    <FormField name={name} label={label} rules={rules}>
      <Input
        type="time"
        {...register(name, rules)}
        placeholder={placeholder}
        error={!!errors[name]}
        className={className}
      />
    </FormField>
  );
};
