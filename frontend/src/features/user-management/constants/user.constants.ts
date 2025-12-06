import type { UserRole, Gender } from '@/constants/enums';
import type { SelectOption } from '@/components/ui';

export const roleOptions: SelectOption[] = [
  { value: '', label: 'すべて' },
  { value: 'user', label: 'ユーザー' },
  { value: 'admin', label: '管理者' },
];

export const genderOptions: SelectOption[] = [
  { value: '', label: 'すべて' },
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: 'その他' },
];

export const roleLabelMap: Record<UserRole, string> = {
  user: 'ユーザー',
  admin: '管理者',
};

export const genderLabelMap: Record<Gender, string> = {
  male: '男性',
  female: '女性',
  other: 'その他',
};
