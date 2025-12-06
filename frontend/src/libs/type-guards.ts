import type { UserRole, Gender } from '@/types/user';
import { USER_ROLES, GENDERS } from '@/constants/enums';

/**
 * UserRoleの型ガード
 * URLパラメータから取得した値が有効なUserRoleかどうかをチェック
 */
export const isValidUserRole = (role: string | null): role is UserRole => {
  if (!role) return false;
  return USER_ROLES.includes(role as UserRole);
};

/**
 * Genderの型ガード
 * URLパラメータから取得した値が有効なGenderかどうかをチェック
 */
export const isValidGender = (gender: string | null): gender is Gender => {
  if (!gender) return false;
  return GENDERS.includes(gender as Gender);
};
