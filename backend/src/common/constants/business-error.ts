/**
 * 業務エラーメッセージの定数定義
 */

export const CREATE = {
  USER_ID_REQUIRED: '作成時はuserIdが必要です',
  FAILED: '作成に失敗しました',
} as const;

export const UPDATE = {
  ID_REQUIRED: '更新時はIDが必要です',
  USER_ID_REQUIRED: '更新時はuserIdが必要です',
  FAILED: '更新に失敗しました',
} as const;

export const DELETE = {
  ID_REQUIRED: '削除時はIDが必要です',
  USER_ID_REQUIRED: '削除時はuserIdが必要です',
  FOREIGN_KEY_CONSTRAINT:
    'この部署にユーザーが割り当てられているため削除できません',
  FACULTY_FOREIGN_KEY_CONSTRAINT:
    'この学部に関連するデータが存在するため削除できません',
} as const;

export const ID_REQUIRED = 'IDが必要です';

export const getEntityIdRequired = (entityName: string): string =>
  `${entityName}を更新する際は${entityName}Entity.idが必要です`;
