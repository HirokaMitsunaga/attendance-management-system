import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import type { UseFormSetError } from 'react-hook-form';
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

type UseUserFormParams = {
  userId: string | undefined;
};

const EMPTY_USER_FORM_DATA: UserFormData = {
  email: '',
  role: 'user',
  firstName: '',
  lastName: '',
  gender: '',
};

export const useUserForm = ({ userId }: UseUserFormParams) => {
  const isEdit = userId && userId !== 'new';
  const [isLoading, setIsLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserResponseDto | null>(null);

  const fetchUser = useCallback(async () => {
    if (!isEdit || !userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient<UserResponseDto>(`/users/${userId}`);
      setUser(data);
    } catch (err) {
      const message = extractErrorMessage(err, errorMessages.userFetchFailed);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isEdit]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleSubmit = useCallback(
    async (data: UserFormData, setFormError: UseFormSetError<UserFormData>) => {
      try {
        if (isEdit && user) {
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
        } else {
          await apiClient<UserResponseDto>('/users', {
            method: 'POST',
            body: {
              email: data.email,
              role: data.role,
              firstName: data.firstName,
              lastName: data.lastName,
              gender: data.gender || null,
            },
          });
        }
        toast.success(
          isEdit ? 'ユーザーを更新しました' : 'ユーザーを作成しました',
        );
      } catch (err) {
        handleFormError(
          err,
          setFormError,
          setError,
          isEdit
            ? errorMessages.userUpdateFailed
            : errorMessages.userCreateFailed,
        );
        throw err;
      }
    },
    [isEdit, user],
  );

  const handleCancel = useCallback(() => {
    // ダイアログを閉じるだけ（何もしない）
  }, []);

  const defaultValues: UserFormData = useMemo(() => {
    if (user) {
      return {
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender || '',
      };
    }
    // 新規作成時は常に同じ値なので、定数として返す
    return EMPTY_USER_FORM_DATA;
  }, [user]);

  return {
    isLoading,
    error,
    isEdit,
    defaultValues,
    handleSubmit,
    handleCancel,
  };
};
