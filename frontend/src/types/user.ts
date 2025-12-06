// 型定義は constants/enums から再エクスポート
import type { UserRole, Gender } from '@/constants/enums';
export type { UserRole, Gender } from '@/constants/enums';
export { USER_ROLES, GENDERS } from '@/constants/enums';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  imageUrl?: string;
};

export type UserResponseDto = {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  gender: Gender | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type UserListResponseDto = {
  users: UserResponseDto[];
  total: number;
  page: number;
  pageSize: number;
};
