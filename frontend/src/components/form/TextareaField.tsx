'use client';

import { Textarea } from '../ui';
import { FormField } from './FormField';
import { useFormContext, useFormState } from 'react-hook-form';

type TextareaFieldProps = {
  name: string;
  label?: string;
  rules?: Parameters<ReturnType<typeof useFormContext>['register']>[1];
  placeholder?: string;
  rows?: number;
};

export const TextareaField = ({
  name,
  label,
  rules,
  placeholder,
  rows,
}: TextareaFieldProps) => {
  const { register, control } = useFormContext();
  const { errors } = useFormState({ control });

  return (
    <FormField name={name} label={label} rules={rules}>
      <Textarea
        {...register(name, rules)}
        placeholder={placeholder}
        error={errors[name]?.message as string | undefined}
        rows={rows}
      />
    </FormField>
  );
};
