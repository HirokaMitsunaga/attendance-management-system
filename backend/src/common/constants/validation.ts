/**
 * バリデーションメッセージの定数定義
 */

/**
 * 必須フィールドのエラーメッセージを生成する関数
 * @param fieldName フィールド名（例: 'ユーザーID', '部署名'）
 * @returns エラーメッセージ（例: 'ユーザーIDは必須です'）
 */
export const REQUIRED_FIELD = (fieldName: string): string =>
  `${fieldName}は必須です`;

/**
 * バリデーションメッセージ定数
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: {
    FORM_TYPE: 'フォームタイプは必須です',
    NAME: '名前は必須です',
    URL_PARAMS: 'URLパラメータは必須です',
    EMAIL: 'メールアドレスは必須です',
    ROLE: '権限は必須です',
    FIRST_NAME: '名は必須です',
    LAST_NAME: '姓は必須です',
  },
} as const;

export const INVALID = {
  PAGE: 'pageは1以上の整数である必要があります',
  PAGE_SIZE: 'pageSizeは1以上の整数である必要があります',
  ROLE: '権限はuser、adminのいずれかである必要があります',
  EMAIL_FORMAT: 'メールアドレスの形式が正しくありません',
} as const;

/**
 * 形式不正のエラーメッセージを生成する関数
 * @param fieldName フィールド名（例: 'メールアドレス', 'URL'）
 * @returns エラーメッセージ（例: 'メールアドレスの形式が正しくありません'）
 */
export const INVALID_FORMAT = (fieldName: string): string =>
  `${fieldName}の形式が正しくありません`;
