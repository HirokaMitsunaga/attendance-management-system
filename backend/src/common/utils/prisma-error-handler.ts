import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NotFoundError } from '../errors/not-found.error';
import { BadRequestError } from '../errors/bad-request.error';

/**
 * Prismaエラーハンドリングの設定
 */
type PrismaErrorHandlerOptions = {
  /** リソース名（例: '面接官'） */
  resourceName: string;
  /** ID（エラーメッセージ用） */
  id: string;
  /** P2002（ユニーク制約違反）に対するカスタムメッセージ */
  duplicateMessage?: string;
  /** P2003（外部キー制約違反）に対するカスタムハンドラー */
  foreignKeyHandler?: (error: PrismaClientKnownRequestError) => never;
  /** P2025（Not Found）に対するカスタムリソース名（省略時はresourceNameを使用） */
  notFoundResourceName?: string;
};

/**
 * Prismaのエラーをハンドリングするヘルパー
 *
 * @example
 * ```ts
 * try {
 *   // Prisma操作
 * } catch (error) {
 *   this.logger.error(error, undefined, 'RepositoryName');
 *   handlePrismaError(error, {
 *     resourceName: '面接官',
 *     id: interviewer.userId,
 *     duplicateMessage: 'このユーザーは既に面接官として登録されています',
 *     foreignKeyHandler: (err) => {
 *       throw new NotFoundError('ユーザー', interviewer.userId);
 *     },
 *   });
 * }
 * ```
 *
 * @param error 発生したエラー
 * @param options エラーハンドリングの設定
 * @throws NotFoundError | BadRequestError | 元のエラー
 */
export const handlePrismaError = (
  error: unknown,
  options: PrismaErrorHandlerOptions,
): never => {
  if (!(error instanceof PrismaClientKnownRequestError)) {
    throw error;
  }

  // P2025: 対象が見つからない (Not Found)
  if (error.code === 'P2025') {
    throw new NotFoundError(
      options.notFoundResourceName || options.resourceName,
      options.id,
    );
  }

  // P2002: ユニーク制約違反 (Duplicate)
  if (error.code === 'P2002') {
    const message =
      options.duplicateMessage ||
      `${options.resourceName}は既に登録されています`;
    throw new BadRequestError(message);
  }

  // P2003: 外部キー制約違反
  if (error.code === 'P2003') {
    // カスタムハンドラーが指定されている場合はそれを使用（必ずthrowする想定）
    if (options.foreignKeyHandler) {
      // foreignKeyHandlerはneverを返すため、returnでTypeScriptに伝える
      return options.foreignKeyHandler(error);
    }
    // デフォルトのメッセージ（ハンドラーが指定されていない場合）
    throw new BadRequestError('関連するデータが見つかりません');
  }

  // その他のエラーはそのまま再スロー
  throw error;
};
