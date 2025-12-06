/**
 * ENUM定義ファイル
 * すべてのENUM値はここから取得すること
 */

// ユーザー権限
export type UserRole = 'user' | 'admin';
export const USER_ROLES: UserRole[] = ['user', 'admin'];

// 性別
export type Gender = 'male' | 'female' | 'other';
export const GENDERS: Gender[] = ['male', 'female', 'other'];
