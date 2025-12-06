import { useMemo } from 'react';
import toast from 'react-hot-toast';
import type { UseFormSetError } from 'react-hook-form';
import { useSWRData } from '@/libs/swr-client';
import { apiClient } from '@/libs/api-client';
import { extractErrorMessage, handleFormError } from '@/libs/error-handler';
import { errorMessages } from '@/constants/error-messages';
import type { UserResponseDto, UserRole, Gender } from '@/types/user';

type UserFormData = {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  gender: Gender | '';
};

type UseUserDetailParams = {
  userId: string;
};

export const useUserDetail = ({ userId }: UseUserDetailParams) => {
  // SWRでデータ取得（画面描画なのでSWRを使用）
  const {
    data: user,
    error: swrError,
    isLoading,
    mutate,
  } = useSWRData<UserResponseDto>(userId ? `/users/${userId}` : null);

  // エラーメッセージを取得
  const error = useMemo(() => {
    if (!swrError) return null;
    return extractErrorMessage(swrError, errorMessages.userFetchFailed);
  }, [swrError]);

  const handleSubmit = async (
    data: UserFormData,
    setFormError: UseFormSetError<UserFormData>,
  ) => {
    if (!user) return;

    try {
      // データ更新はapiClientを使用（Mutation）
      await apiClient<UserResponseDto>(`/users/${user.id}`, {
        method: 'PUT',
        body: {
          email: data.email,
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender || null,
        },
      });
      // 更新後はSWRのキャッシュを再検証
      await mutate();
      toast.success('ユーザーを更新しました');
    } catch (err) {
      handleFormError(
        err,
        setFormError,
        () => {}, // setErrorは不要（SWRがエラーを管理）
        errorMessages.userUpdateFailed,
      );
      throw err;
    }
  };

  return {
    user: user || null,
    isLoading,
    error,
    handleSubmit,
  };
};
