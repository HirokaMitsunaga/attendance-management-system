'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  Button,
  Table,
  SearchIcon,
  ResetIcon,
  TrashIcon,
  CsvExportButton,
  CancelIcon,
} from '@/components/ui';
import { TextField } from '@/components/form';
import { useForm, FormProvider } from 'react-hook-form';
import type { SearchConditionResponseDto } from '@/types/search-condition';
import { formatDateToISOString } from '@/libs/date-utils';
import { convertToCSV, downloadCSV } from '@/libs/csv-utils';
import { apiClient } from '@/libs/api-client';
import { extractErrorMessage } from '@/libs/error-handler';
import toast from 'react-hot-toast';
import type { UserResponseDto } from '@/types/user';
import {
  roleLabelMap,
  genderLabelMap,
} from '@/features/user-management/constants/user.constants';
import { userExportCsvHeaders } from '@/features/user-management/constants/user-csv.constants';

type SearchConditionListDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  conditions: SearchConditionResponseDto[];
  onDelete: (id: string) => Promise<void>;
  onSearch: (searchParams: { name?: string }) => Promise<void>;
  onApply: (condition: SearchConditionResponseDto) => void;
  isLoading?: boolean;
};

type SearchFormData = {
  name: string;
};

export const SearchConditionListDialog = ({
  isOpen,
  onClose,
  conditions,
  onDelete,
  onSearch,
  onApply,
  isLoading = false,
}: SearchConditionListDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [deletingCondition, setDeletingCondition] =
    useState<SearchConditionResponseDto | null>(null);

  const methods = useForm<SearchFormData>({
    defaultValues: { name: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    await onSearch({ name: data.name || undefined });
  });

  const handleReset = useCallback(() => {
    methods.reset({ name: '' });
    void onSearch({});
  }, [methods, onSearch]);

  const handleDeleteClick = useCallback(
    (condition: SearchConditionResponseDto) => {
      setDeletingCondition(condition);
    },
    [],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingCondition) return;

    try {
      setIsDeleting(true);
      await onDelete(deletingCondition.id);
      setDeletingCondition(null);
    } catch {
      // エラーはonDelete内で処理済み
    } finally {
      setIsDeleting(false);
    }
  }, [deletingCondition, onDelete]);

  const handleDeleteCancel = useCallback(() => {
    setDeletingCondition(null);
  }, []);

  const handleExportSearchResultCSV = useCallback(
    async (condition: SearchConditionResponseDto) => {
      try {
        setIsExporting(condition.id);
        const params = new URLSearchParams(condition.urlParams);
        const exportUsers = await apiClient<UserResponseDto[]>(
          `/users/export?${params.toString()}`,
        );

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
        const filename = `${
          condition.name
        }_検索結果_${formatDateToISOString()}.csv`;
        downloadCSV({ csvContent, filename });
        toast.success('CSV出力が完了しました');
      } catch (err) {
        const message = extractErrorMessage(
          err,
          '検索結果のCSV出力に失敗しました',
        );
        toast.error(message);
      } finally {
        setIsExporting(null);
      }
    },
    [],
  );

  const columns = [
    { key: 'name', label: '名前' },
    {
      key: 'actions',
      label: '操作',
      render: (_value: unknown, row: SearchConditionResponseDto) => (
        <div className="flex gap-1">
          <Button
            size="md"
            onClick={(e) => {
              e.stopPropagation();
              onApply(row);
              onClose();
            }}
            icon={<SearchIcon />}
          >
            検索
          </Button>
          <CsvExportButton
            size="md"
            onExport={async () => {
              await handleExportSearchResultCSV(row);
            }}
            disabled={isExporting === row.id}
          >
            検索結果をCSV出力
          </CsvExportButton>
          <Button
            size="md"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
            disabled={isDeleting}
            icon={<TrashIcon />}
          >
            削除
          </Button>
        </div>
      ),
    },
  ];

  const data = conditions;

  useEffect(() => {
    if (isOpen) {
      void onSearch({});
    }
  }, [isOpen, onSearch]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="検索条件一覧"
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose} icon={<CancelIcon />}>
          閉じる
        </Button>
      }
    >
      <div className="space-y-4">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <TextField
                  name="name"
                  label="名前で検索"
                  placeholder="検索条件の名前を入力"
                />
              </div>
              <Button type="submit" icon={<SearchIcon />}>
                検索
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                icon={<ResetIcon />}
              >
                リセット
              </Button>
            </div>
          </form>
        </FormProvider>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        ) : (
          <Table
            columns={columns}
            data={data}
            emptyMessage="検索条件が見つかりません"
          />
        )}
      </div>

      <Dialog
        isOpen={!!deletingCondition}
        onClose={handleDeleteCancel}
        title="検索条件削除"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={isDeleting}
              icon={<CancelIcon />}
            >
              キャンセル
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              isLoading={isDeleting}
              icon={<TrashIcon />}
            >
              削除
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            以下の検索条件を削除しますか？この操作は取り消せません。
          </p>
          {deletingCondition && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900">
                検索条件名: {deletingCondition.name}
              </p>
            </div>
          )}
        </div>
      </Dialog>
    </Dialog>
  );
};
