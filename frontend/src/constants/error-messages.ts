export const errorMessages = {
  // ユーザー関連
  userNotFound: 'ユーザーが見つかりません',
  userFetchFailed: 'ユーザー情報の取得に失敗しました',
  userUpdateFailed: 'ユーザーの更新に失敗しました',
  userCreateFailed: 'ユーザーの作成に失敗しました',
  userListFetchFailed: 'ユーザー一覧の取得に失敗しました',

  // CSV関連
  csvExportFailed: 'CSV出力に失敗しました',
  csvUploadFailed: 'CSVアップロードに失敗しました',
  // 共通
  requestFailed: 'リクエストに失敗しました',
  unexpectedError: '予期せぬエラーが発生しました',
} as const;
