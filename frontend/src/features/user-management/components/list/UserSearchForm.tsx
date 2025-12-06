'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { Button, SearchIcon, ResetIcon } from '@/components/ui';
import { TextField, SelectField } from '@/components/form';
import { roleOptions, genderOptions } from '../../constants/user.constants';
import type { UserRole, Gender } from '@/types/user';

type UserSearchFormData = {
  id: string;
  search: string;
  role: UserRole | '';
  gender: Gender | '';
};

type UserSearchFormProps = {
  onSearch: (data: UserSearchFormData) => void;
  onReset: () => void;
  searchParams: UserSearchFormData;
};

export const UserSearchForm = ({
  onSearch,
  onReset,
  searchParams,
}: UserSearchFormProps) => {
  const methods = useForm<UserSearchFormData>({
    defaultValues: searchParams,
    mode: 'onBlur',
  });

  const handleSubmit = methods.handleSubmit((data) => {
    onSearch(data);
  });

  const handleReset = () => {
    // フォーム側の見た目をリセットする必要はありません（再マウントされるので）
    // URLをリセットする処理だけ呼ぶ
    onReset();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="flex gap-4 items-end flex-wrap">
          <div className="w-full md:w-80">
            <TextField
              name="id"
              label="ID"
              placeholder="ID（カンマ/スペース区切り可）"
            />
          </div>
          <div className="w-80">
            <TextField
              name="search"
              label="検索"
              placeholder="メールアドレス、名前で検索"
            />
          </div>
          <div className="w-40 z-10">
            <SelectField name="role" label="権限" options={roleOptions} />
          </div>
          <div className="w-40">
            <SelectField name="gender" label="性別" options={genderOptions} />
          </div>
          <Button type="submit" icon={<SearchIcon />}>
            検索
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            icon={<ResetIcon />}
          >
            リセット
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
