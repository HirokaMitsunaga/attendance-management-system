import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSWRData } from '@/libs/swr-client';
import { buildSWRKey } from '@/libs/swr-utils';
import { extractErrorMessage } from '@/libs/error-handler';
import { errorMessages } from '@/constants/error-messages';
import { DEFAULT_PAGE_SIZE } from '@/constants/page';
import { isValidUserRole, isValidGender } from '@/libs/type-guards';
import type { UserListResponseDto, UserRole, Gender } from '@/types/user';

export type UserSearchFormData = {
  id: string;
  search: string;
  role: UserRole | '';
  gender: Gender | '';
};

export const useUserList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLパラメータから検索条件とページを取得（型ガードで安全性を確保）
  const getSearchParamsFromUrl = useCallback((): UserSearchFormData & {
    page: number;
  } => {
    const roleParam = searchParams.get('role');
    const genderParam = searchParams.get('gender');

    return {
      id: searchParams.get('id') || '',
      search: searchParams.get('search') || '',
      role: isValidUserRole(roleParam) ? roleParam : '',
      gender: isValidGender(genderParam) ? genderParam : '',
      page: Number(searchParams.get('page')) || 1,
    };
  }, [searchParams]);

  const searchKey = useMemo(() => {
    const params = getSearchParamsFromUrl();
    // 検索条件がある場合は /users/search/detail を使用
    const hasSearchParams =
      params.id || params.search || params.role || params.gender;
    const endpoint = hasSearchParams ? '/users/search/detail' : '/users';
    return buildSWRKey(
      endpoint,
      hasSearchParams
        ? {
            id: params.id,
            search: params.search,
            role: params.role,
            gender: params.gender,
          }
        : undefined,
      {
        page: params.page,
        pageSize: DEFAULT_PAGE_SIZE,
      },
    );
  }, [getSearchParamsFromUrl]);

  // 手動で設定するエラー（CSVエクスポートなど、SWRを使わない操作のエラー）
  const [manualError, setManualError] = useState<string | null>(null);

  // SWRでデータ取得（共通のuseSWRDataを使用）
  const {
    data,
    error: swrError,
    isLoading,
    mutate,
  } = useSWRData<UserListResponseDto>(searchKey);

  // エラーメッセージを取得（SWRのエラーと手動で設定したエラーを統合）
  const error = useMemo(() => {
    if (manualError) return manualError;
    if (!swrError) return null;
    return extractErrorMessage(swrError, errorMessages.userListFetchFailed);
  }, [swrError, manualError]);

  // fetchUsersの代わりにmutateを返す（後方互換性のため）
  const fetchUsers = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const updateUrlParams = useCallback(
    (params: UserSearchFormData, pageNum: number, useReplace = false) => {
      const urlParams = new URLSearchParams();

      // 値がある場合のみパラメータに追加
      const paramMap: Record<string, string> = {
        id: params.id,
        search: params.search,
        role: params.role,
        gender: params.gender,
      };

      for (const [key, value] of Object.entries(paramMap)) {
        if (value) {
          urlParams.set(key, value);
        }
      }

      if (pageNum > 1) {
        urlParams.set('page', pageNum.toString());
      }

      const queryString = urlParams.toString();
      const url = queryString
        ? `/admin/user-management?${queryString}`
        : '/admin/user-management';

      // ページネーション時はreplace、検索時はpush
      if (useReplace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [router],
  );

  const handleSearch = (data: UserSearchFormData) => {
    // URLのみを変更し、状態はURLパラメータの変更検知から更新させる
    // 検索時はpush（履歴に追加）
    updateUrlParams(data, 1, false);
  };

  const handleReset = () => {
    // URLのみを変更し、状態はURLパラメータの変更検知から更新させる
    router.push('/admin/user-management');
  };

  const handlePageChange = (newPage: number) => {
    const currentParams = getSearchParamsFromUrl();
    // ページネーション時はreplace（履歴に追加しない）
    updateUrlParams(
      {
        id: currentParams.id,
        search: currentParams.search,
        role: currentParams.role,
        gender: currentParams.gender,
      },
      newPage,
      true, // replaceを使用
    );
  };

  const currentSearchParams = getSearchParamsFromUrl();

  return {
    users: data?.users || [],
    total: data?.total || 0,
    page: currentSearchParams.page,
    isLoading,
    error,
    setError: setManualError, // 手動でエラーを設定（CSVエクスポートなど）
    handleSearch,
    handleReset,
    setPage: handlePageChange,
    searchParams: {
      id: currentSearchParams.id,
      search: currentSearchParams.search,
      role: currentSearchParams.role,
      gender: currentSearchParams.gender,
    },
    fetchUsers,
    mutate, // SWRのmutateも公開（必要に応じて使用可能）
  };
};
