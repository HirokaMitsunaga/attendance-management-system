import { useCallback } from 'react';
import { formatDateToISOString } from '@/libs/date-utils';
import { downloadExcel } from '@/libs/excel-utils';
import { roleLabelMap, genderLabelMap } from '../constants/user.constants';
import {
  userCreateTemplateExcelHeaders,
  userEditTemplateExcelHeaders,
} from '../constants/user-excel.constants';
import { apiClient } from '@/libs/api-client';
import type { UserResponseDto } from '@/types/user';
import { extractErrorMessage } from '@/libs/error-handler';
import toast from 'react-hot-toast';

export const useUserCsvTemplate = () => {
  const fetchAllUsers = useCallback(async (): Promise<UserResponseDto[]> => {
    try {
      // /users/exportエンドポイントで全ユーザーを取得
      const allUsers = await apiClient<UserResponseDto[]>('/users/export');
      return allUsers;
    } catch (err) {
      const message = extractErrorMessage(
        err,
        'ユーザー一覧の取得に失敗しました',
      );
      toast.error(message);
      throw new Error(message);
    }
  }, []);

  const handleDownloadTemplateCSV = useCallback(async () => {
    const templateData = [
      {
        メールアドレス: 'example@example.com',
        姓: '山田',
        名: '太郎',
        権限: 'ユーザー',
        性別: '男性',
      },
    ];

    const filename = `ユーザー登録テンプレート_${formatDateToISOString()}.xlsx`;
    await downloadExcel({
      data: templateData,
      headers: userCreateTemplateExcelHeaders(),
      filename,
      sheetName: 'ユーザー登録',
    });
  }, []);

  const handleDownloadEditTemplateCSV = useCallback(async () => {
    try {
      const allUsers = await fetchAllUsers();
      const templateData = allUsers.map((user) => ({
        ID: user.id,
        メールアドレス: user.email,
        姓: user.lastName,
        名: user.firstName,
        権限: roleLabelMap[user.role],
        性別: user.gender ? genderLabelMap[user.gender] : '',
      }));

      const filename = `ユーザー編集テンプレート_${formatDateToISOString()}.xlsx`;
      await downloadExcel({
        data: templateData,
        headers: userEditTemplateExcelHeaders(),
        filename,
        sheetName: 'ユーザー編集',
      });
    } catch {
      // エラーはfetchAllUsers内で処理済み
    }
  }, [fetchAllUsers]);

  return {
    handleDownloadTemplateCSV,
    handleDownloadEditTemplateCSV,
  };
};
