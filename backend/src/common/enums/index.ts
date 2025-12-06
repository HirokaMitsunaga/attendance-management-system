/**
 * ENUM定義ファイル
 * すべてのENUM値はここから取得すること
 */

// 面接官カテゴリ
export type InterviewerCategory = 'フロント' | '現場社員';
export const INTERVIEWER_CATEGORIES: InterviewerCategory[] = [
  'フロント',
  '現場社員',
];

// ユーザー権限
export type UserRole = 'user' | 'admin';
export const USER_ROLES = ['user', 'admin'] as const;

// 性別
export type Gender = 'male' | 'female' | 'other';
export const GENDERS = ['male', 'female', 'other'] as const;

// 教育タイプ
export type EducationType =
  | '大学院'
  | '大学'
  | '短期大学'
  | '専門学校'
  | '高等学校'
  | 'その他';
export const EDUCATION_TYPES: EducationType[] = [
  '大学院',
  '大学',
  '短期大学',
  '専門学校',
  '高等学校',
  'その他',
];

// ロケーションタイプ
export type LocationType = 'オンライン' | '対面' | 'オンライン_対面';
export const LOCATION_TYPES: LocationType[] = [
  'オンライン',
  '対面',
  'オンライン_対面',
];
