import { UserEntity } from '../entities/user.entity';
import { NotFoundError } from '../../common/errors/not-found.error';

/**
 * ユーザーが存在し、削除されていないことを確認する
 * 存在しない、または削除済みの場合はNotFoundErrorをスロー
 * 存在する場合はUserEntityを返す
 */
export const validateUserExists = (
  user: UserEntity | null,
  userId: string,
): UserEntity => {
  if (!user || user.deletedAt) {
    throw new NotFoundError('ユーザー', userId);
  }
  return user;
};
