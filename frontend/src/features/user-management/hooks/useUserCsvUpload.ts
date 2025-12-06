import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '@/libs/api-client';
import { extractErrorMessage } from '@/libs/error-handler';
import { errorMessages } from '@/constants/error-messages';
import { parseCSV } from '@/libs/csv-parse';
import { chunk } from '@/libs/array-utils';
import { roleOptions, genderOptions } from '../constants/user.constants';
import type { UserResponseDto, UserRole, Gender } from '@/types/user';

type UseUserCsvUploadParams = {
  fetchUsers: () => Promise<void>;
};

export const useUserCsvUpload = ({ fetchUsers }: UseUserCsvUploadParams) => {
  const validateFileType = (file: File): void => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'csv') {
      throw new Error(
        `CSVファイルを選択してください。選択されたファイル: ${file.name}（${
          file.type || '不明な形式'
        }）`,
      );
    }

    if (
      file.type &&
      !file.type.includes('csv') &&
      !file.type.includes('text')
    ) {
      if (
        file.type.includes('spreadsheet') ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')
      ) {
        throw new Error(
          'Excelファイルが選択されました。CSVファイルを選択してください。Excelファイルを使用する場合は、「Excelテンプレート」ボタンからダウンロードしたファイルをCSV形式で保存してからアップロードしてください。',
        );
      }
      throw new Error(
        `対応していないファイル形式です。CSVファイルを選択してください。選択されたファイル: ${file.name}（${file.type}）`,
      );
    }
  };

  const validateCsvData = (
    csvData: Record<string, string>[],
    isEdit: boolean,
  ): Record<string, string>[] => {
    // 空行を除外
    const validCsvData = csvData.filter((row) => {
      const hasAnyValue = Object.values(row).some(
        (value) => String(value || '').trim() !== '',
      );
      return hasAnyValue;
    });

    if (validCsvData.length === 0) {
      throw new Error('CSVファイルにデータが含まれていません');
    }

    // 必須フィールドの検証（作成モード）
    if (!isEdit) {
      const invalidRows = validCsvData.filter((row) => {
        const email = String(row['メールアドレス'] || '').trim();
        const lastName = String(row['姓'] || '').trim();
        const firstName = String(row['名'] || '').trim();
        return !email || !lastName || !firstName;
      });

      if (invalidRows.length > 0) {
        const firstInvalidRow = invalidRows[0];
        const rowIndex = validCsvData.indexOf(firstInvalidRow);
        const allKeys = Object.keys(firstInvalidRow);

        throw new Error(
          `必須項目が不足している行があります: ${invalidRows.length}件。例: 行${
            rowIndex + 1
          }の列名=[${allKeys.join(', ')}]`,
        );
      }

      // メールアドレスの重複チェック
      const emails = validCsvData.map((row) => row['メールアドレス']);
      const duplicates = emails.filter(
        (email, index) => emails.indexOf(email) !== index,
      );
      if (duplicates.length > 0) {
        throw new Error(
          `重複するメールアドレスがあります: ${duplicates.join(', ')}`,
        );
      }
    }

    // 編集モードでのID存在チェック
    if (isEdit) {
      const invalidRows = validCsvData.filter((row) => !row['ID']);
      if (invalidRows.length > 0) {
        throw new Error(
          `IDが不足している行があります: ${invalidRows.length}件`,
        );
      }
    }

    return validCsvData;
  };

  const convertCsvRowToUser = useCallback(
    (
      row: Record<string, string>,
      isEdit: boolean,
    ): {
      id?: string;
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      gender: Gender | null;
    } => {
      const roleOption = roleOptions.find(
        (opt) => opt.label === row['権限'] || opt.value === row['権限'],
      );
      const genderOption = genderOptions.find(
        (opt) => opt.label === row['性別'] || opt.value === row['性別'],
      );

      return {
        ...(isEdit && { id: row['ID'] }),
        email: row['メールアドレス'],
        firstName: row['名'],
        lastName: row['姓'],
        role: (roleOption?.value || 'user') as UserRole,
        gender: (genderOption?.value || null) as Gender | null,
      };
    },
    [],
  );

  const handleBulkEdit = useCallback(
    async (
      users: Array<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        gender: Gender | null;
      }>,
    ) => {
      const userChunks = chunk(users, 50);
      let succeeded = 0;
      let failed = 0;

      for (const userChunk of userChunks) {
        const results = await Promise.allSettled(
          userChunk.map((user) =>
            apiClient<UserResponseDto>(`/users/${user.id}`, {
              method: 'PUT',
              body: {
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                gender: user.gender,
              },
            }),
          ),
        );

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            succeeded++;
          } else {
            failed++;
          }
        });
      }

      await fetchUsers();
      if (failed > 0) {
        toast.error(`${succeeded}件成功、${failed}件失敗しました`);
      } else {
        toast.success(`ユーザーを${succeeded}件更新しました`);
      }
    },
    [fetchUsers],
  );

  const handleBulkCreate = useCallback(
    async (
      users: Array<{
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        gender: Gender | null;
      }>,
    ) => {
      await apiClient<UserResponseDto[]>('/users/bulk', {
        method: 'POST',
        body: { users },
      });

      await fetchUsers();
      toast.success(`ユーザーを${users.length}件登録しました`);
    },
    [fetchUsers],
  );

  const handleUploadCSV = useCallback(
    async (file: File, isEdit: boolean) => {
      try {
        validateFileType(file);

        const csvData = await parseCSV(file);
        const validCsvData = validateCsvData(csvData, isEdit);

        const users = validCsvData.map((row) =>
          convertCsvRowToUser(row, isEdit),
        );

        if (isEdit) {
          await handleBulkEdit(users as Parameters<typeof handleBulkEdit>[0]);
        } else {
          await handleBulkCreate(
            users as Parameters<typeof handleBulkCreate>[0],
          );
        }
      } catch (err) {
        const message = extractErrorMessage(err, errorMessages.csvUploadFailed);
        throw new Error(message);
      }
    },
    [handleBulkEdit, handleBulkCreate, convertCsvRowToUser],
  );

  return {
    handleUploadCSV,
  };
};
