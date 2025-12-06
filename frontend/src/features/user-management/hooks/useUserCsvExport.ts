import { useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import { extractErrorMessage } from '@/libs/error-handler';
import { errorMessages } from '@/constants/error-messages';
import { formatDateToISOString } from '@/libs/date-utils';
import { convertToCSV, downloadCSV } from '@/libs/csv-utils';
import { roleLabelMap, genderLabelMap } from '../constants/user.constants';
import { userExportCsvHeaders } from '../constants/user-csv.constants';
import type { UserResponseDto, UserRole, Gender } from '@/types/user';

type UserSearchFormData = {
  id: string;
  search: string;
  role: UserRole | '';
  gender: Gender | '';
};

type UseUserCsvExportParams = {
  searchParams: UserSearchFormData;
};

export const useUserCsvExport = ({ searchParams }: UseUserCsvExportParams) => {
  const handleExportCSV = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchParams.id) {
        params.append('id', searchParams.id);
      }
      if (searchParams.search) {
        params.append('search', searchParams.search);
      }
      if (searchParams.role) {
        params.append('role', searchParams.role);
      }
      if (searchParams.gender) {
        params.append('gender', searchParams.gender);
      }

      const exportUsers = await apiClient<UserResponseDto[]>(
        `/users/export?${params.toString()}`,
      );

      if (!exportUsers || exportUsers.length === 0) {
        throw new Error('出力するデータがありません');
      }

      const csvData = exportUsers.map((user) => ({
        ID: user.id,
        メールアドレス: user.email,
        姓: user.lastName,
        名: user.firstName,
        権限: roleLabelMap[user.role],
        性別: user.gender ? genderLabelMap[user.gender] : '-',
      }));

      const csvContent = convertToCSV({
        data: csvData,
        headers: userExportCsvHeaders,
      });
      const filename = `ユーザー一覧_${formatDateToISOString()}.csv`;
      downloadCSV({ csvContent, filename });
    } catch (err) {
      const message = extractErrorMessage(err, errorMessages.csvExportFailed);
      throw new Error(message);
    }
  }, [searchParams]);

  return {
    handleExportCSV,
  };
};
