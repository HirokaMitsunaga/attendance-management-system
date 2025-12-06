'use client';

import { MultiSelect, type MultiSelectOption } from '../ui';
import { FormField } from './FormField';
import { useFormContext, useFormState } from 'react-hook-form';

type MultiSelectFieldProps = {
  name: string;
  label?: string;
  rules?: Parameters<ReturnType<typeof useFormContext>['register']>[1];
  options: MultiSelectOption[];
  disabled?: boolean;
};

export const MultiSelectField = ({
  name,
  label,
  rules,
  options,
  disabled,
}: MultiSelectFieldProps) => {
  const { control, setValue, watch } = useFormContext();
  const { errors } = useFormState({ control });
  const value = watch(name) || [];

  const handleChange = (newValue: string[]) => {
    setValue(name, newValue, { shouldValidate: true });
  };

  return (
    <FormField name={name} label={label} rules={rules}>
      <MultiSelect
        name={name}
        options={options}
        error={!!errors[name]}
        disabled={disabled}
        value={value}
        onChange={handleChange}
      />
    </FormField>
  );
};
