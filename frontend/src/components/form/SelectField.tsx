'use client';

import { Select, type SelectOption } from '../ui';
import { FormField } from './FormField';
import { useFormContext, useFormState } from 'react-hook-form';

type SelectFieldProps = {
  name: string;
  label?: string;
  rules?: Parameters<ReturnType<typeof useFormContext>['register']>[1];
  options: SelectOption[];
  disabled?: boolean;
};

export const SelectField = ({
  name,
  label,
  rules,
  options,
  disabled,
}: SelectFieldProps) => {
  const { register, control } = useFormContext();
  const { errors } = useFormState({ control });

  return (
    <FormField name={name} label={label} rules={rules}>
      <Select
        {...register(name, rules)}
        options={options}
        error={!!errors[name]}
        disabled={disabled}
      />
    </FormField>
  );
};
