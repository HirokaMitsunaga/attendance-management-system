'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Title,
  PageContainer,
  Button,
  Loading,
  CancelIcon,
  SaveIcon,
} from '@/components/ui';
import { TextField, SelectField, FormError } from '@/components/form';
import { roleOptions, genderOptions } from '../../constants/user.constants';
import { useUserForm } from '../../hooks/useUserForm';
import type { UserRole, Gender } from '@/types/user';

type UserFormData = {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  gender: Gender | '';
};

export const UserForm = () => {
  const params = useParams();
  const userId = params?.id as string | undefined;

  const {
    isLoading,
    error,
    isEdit,
    defaultValues,
    handleSubmit,
    handleCancel,
  } = useUserForm({ userId });

  const formKey = useMemo(
    () => (isEdit ? `edit-${userId}` : 'new'),
    [isEdit, userId],
  );

  const methods = useForm<UserFormData>({
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const onSubmit = methods.handleSubmit((data) => {
    void handleSubmit(data, methods.setError);
  });

  if (isLoading) {
    return (
      <PageContainer>
        <Title>{isEdit ? 'ユーザー編集' : 'ユーザー新規登録'}</Title>
        <Loading />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Title>{isEdit ? 'ユーザー編集' : 'ユーザー新規登録'}</Title>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <FormError error={error} />

        <div key={formKey}>
          <FormProvider {...methods}>
            <form onSubmit={onSubmit} noValidate className="space-y-6">
              <div className="space-y-4">
                <TextField
                  name="email"
                  label="メールアドレス"
                  placeholder="メールアドレスを入力（例: user@example.com）"
                  rules={{ required: 'メールアドレスは必須です' }}
                />
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    name="lastName"
                    label="姓"
                    placeholder="姓を入力"
                    rules={{ required: '姓は必須です' }}
                  />
                  <TextField
                    name="firstName"
                    label="名"
                    placeholder="名を入力"
                    rules={{ required: '名は必須です' }}
                  />
                </div>
                <SelectField
                  name="role"
                  label="権限"
                  options={roleOptions.filter((opt) => opt.value !== '')}
                  rules={{ required: '権限は必須です' }}
                />
                <SelectField
                  name="gender"
                  label="性別"
                  options={genderOptions}
                />
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  icon={<CancelIcon />}
                >
                  キャンセル
                </Button>
                <Button type="submit" variant="primary" icon={<SaveIcon />}>
                  {isEdit ? '更新' : '登録'}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </PageContainer>
  );
};
