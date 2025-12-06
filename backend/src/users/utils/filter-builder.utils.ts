import type { Gender, UserRole } from '@prisma/client';
import type { UsersFindManyFilter } from '../domain/users.repository.interface';

type UserSearchParams = {
  id?: string;
  search?: string;
  role?: UserRole;
  gender?: Gender | null;
  page?: number;
  pageSize?: number;
};

/**
 * 検索パラメータからフィルターオブジェクトを構築する
 * undefinedのプロパティを除外してfilterを作成
 */
export const buildUserFilter = (
  params: UserSearchParams,
): UsersFindManyFilter => {
  const filter: UsersFindManyFilter = {};
  if (params.id) filter.id = params.id;
  if (params.search) filter.search = params.search;
  if (params.role !== undefined) filter.role = params.role;
  if (params.gender !== undefined) filter.gender = params.gender;
  if (params.page !== undefined) filter.page = params.page;
  if (params.pageSize !== undefined) filter.pageSize = params.pageSize;
  return filter;
};

/**
 * 検索パラメータからフィルターオブジェクトを構築する（ページネーションなし）
 * undefinedのプロパティを除外してfilterを作成
 */
export const buildUserFilterWithoutPagination = (
  params: Omit<UserSearchParams, 'page' | 'pageSize'>,
): UsersFindManyFilter | undefined => {
  const filter: UsersFindManyFilter = {};
  if (params.id) filter.id = params.id;
  if (params.search) filter.search = params.search;
  if (params.role !== undefined) filter.role = params.role;
  if (params.gender !== undefined) filter.gender = params.gender;

  // 検索条件がない場合はundefinedを返す（全件取得）
  const hasFilter = Object.keys(filter).length > 0;
  return hasFilter ? filter : undefined;
};
