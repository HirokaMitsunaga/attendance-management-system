'use client';

import { useEffect } from 'react';
import {
  FormProvider,
  useForm,
  type SubmitHandler,
  type FieldValues,
} from 'react-hook-form';

type FormProps<T extends FieldValues> = {
  defaultValues: T;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
};

export const Form = <T extends FieldValues>({
  defaultValues,
  onSubmit,
  children,
  mode = 'onBlur',
}: FormProps<T>) => {
  // react-hook-formの型定義の制約により、型アサーションが必要
  const methods = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: defaultValues as any,
    mode,
  });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    methods.reset(defaultValues as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        {children}
      </form>
    </FormProvider>
  );
};
