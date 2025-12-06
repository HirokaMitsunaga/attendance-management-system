'use client';

import { useForm, FormProvider } from 'react-hook-form';
import type { UseFormSetError } from 'react-hook-form';
import { Button, CancelIcon, SaveIcon } from '@/components/ui';
import { TextField, SelectField } from '@/components/form';
import { genderOptions } from '@/features/user-management/constants/user.constants';
import { apiClient } from '@/libs/api-client';
import { useSWRData } from '@/libs/swr-client';
import { toast } from 'react-hot-toast';
import { ApiClientError } from '@/libs/api-client';
import type { UserResponseDto, Gender } from '@/types/user';

type MyPageFormData = {
  firstName: string;
  lastName: string;
  gender: Gender | '';
};

type MyPageFormProps = {
  user: UserResponseDto;
  onCancel: () => void;
  onSuccess: () => void;
};

export const MyPageForm = ({
  user,
  onCancel,
  onSuccess,
}: MyPageFormProps) => {
  const { mutate } = useSWRData<UserResponseDto>('/me');

  const methods = useForm<MyPageFormData>({
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      gender: user.gender || '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      await apiClient(`/users/${user.id}`, {
        method: 'PUT',
        body: {
          email: user.email,
          role: user.role,
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender || null,
        },
      });

      // SWRのキャッシュを再検証
      await mutate();

      toast.success('プロフィールを更新しました');
      onSuccess();
    } catch (err) {
      if (err instanceof ApiClientError && err.details) {
        err.details.forEach((detail) => {
          methods.setError(
            detail.path[0] as keyof MyPageFormData,
            {
              type: 'server',
              message: detail.message,
            },
          );
        });
      } else if (err instanceof ApiClientError) {
        toast.error(err.message);
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('プロフィールの更新に失敗しました');
      }
    }
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
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
              更新
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

