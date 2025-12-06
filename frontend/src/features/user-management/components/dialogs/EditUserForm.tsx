'use client';

import { useForm, FormProvider } from 'react-hook-form';
import type { UseFormSetError } from 'react-hook-form';
import { Button, CancelIcon, SaveIcon } from '@/components/ui';
import { TextField, SelectField } from '@/components/form';
import { roleOptions, genderOptions } from '../../constants/user.constants';
import type { UserResponseDto, UserRole, Gender } from '@/types/user';

type UserFormData = {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  gender: Gender | '';
};

type EditUserFormProps = {
  user: UserResponseDto;
  onSubmit: (
    data: UserFormData,
    setError: UseFormSetError<UserFormData>,
  ) => Promise<void>;
  onCancel: () => void;
  onSuccess: () => Promise<void>;
};

export const EditUserForm = ({
  user,
  onSubmit,
  onCancel,
  onSuccess,
}: EditUserFormProps) => {
  const methods = useForm<UserFormData>({
    defaultValues: {
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender || '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      await onSubmit(data, methods.setError);
      await onSuccess();
    } catch {
      // エラーはonSubmit内で処理済み
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
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

        <div className="flex gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            icon={<CancelIcon />}
          >
            キャンセル
          </Button>
          <Button type="submit" variant="primary" icon={<SaveIcon />}>
            更新
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
