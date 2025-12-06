'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { Loading, Button, CancelIcon, SaveIcon } from '@/components/ui';
import { TextField, SelectField, FormError } from '@/components/form';
import { roleOptions, genderOptions } from '../../constants/user.constants';
import type { UserRole, Gender } from '@/types/user';
import { useUserForm } from '../../hooks/useUserForm';

type UserFormData = {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  gender: Gender | '';
};

type CreateUserFormProps = {
  onSubmit: () => Promise<void>;
  onCancel: () => void;
};

export const CreateUserForm = ({ onSubmit, onCancel }: CreateUserFormProps) => {
  const { isLoading, error, defaultValues, handleSubmit } = useUserForm({
    userId: undefined,
  });

  const methods = useForm<UserFormData>({
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const onSubmitForm = methods.handleSubmit(async (data) => {
    try {
      await handleSubmit(data, methods.setError);
      await onSubmit();
    } catch {
      // エラーはhandleSubmit内で処理済み
    }
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <FormError error={error} />

      <FormProvider {...methods}>
        <form onSubmit={onSubmitForm} noValidate className="space-y-6">
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
            <SelectField name="gender" label="性別" options={genderOptions} />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              icon={<CancelIcon />}
            >
              キャンセル
            </Button>
            <Button type="submit" variant="primary" icon={<SaveIcon />}>
              登録
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
