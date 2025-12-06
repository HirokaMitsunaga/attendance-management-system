'use client';

import {
  Title,
  PageContainer,
  Button,
  Loading,
  CsvExportButton,
  PlusIcon,
  BulkIcon,
  BookmarkIcon,
} from '@/components/ui';
import { SaveSearchConditionButton } from '@/components/features';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useUserManagementDialogs } from '../../hooks/useUserManagementDialogs';
import { UserSearchForm } from './UserSearchForm';
import { FormError } from '@/components/form';
import { UserTable } from './UserTable';
import { UserManagementDialogs } from '../dialogs/UserManagementDialogs';

export const UserManagement = () => {
  const {
    users,
    total,
    page,
    isLoading,
    error,
    setError,
    handleSearch,
    handleReset,
    setPage,
    searchParams,
    handleExportCSV,
    handleDownloadTemplateCSV,
    handleDownloadEditTemplateCSV,
    handleUploadCSV,
    fetchUsers,
  } = useUserManagement();

  const {
    isBulkDialogOpen,
    setIsBulkDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingUserId,
    setEditingUserId,
    isSaveConditionDialogOpen,
    setIsSaveConditionDialogOpen,
    isSearchConditionListDialogOpen,
    setIsSearchConditionListDialogOpen,
    hasSearchConditions,
    filteredConditions,
    isSearchConditionLoading,
    searchConditions,
    saveCondition,
    deleteCondition,
    applyCondition,
    handleCsvExport,
    handleCreateUserSuccess,
    handleEditUserSuccess,
  } = useUserManagementDialogs({
    searchParams,
    fetchUsers,
    handleExportCSV,
    setError,
  });

  if (isLoading) {
    return (
      <PageContainer>
        <Title>ユーザー管理</Title>
        <Loading />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex justify-between items-center">
        <Title>ユーザー管理</Title>
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => setIsBulkDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
            icon={<BulkIcon />}
          >
            一括処理
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsCreateDialogOpen(true)}
            icon={<PlusIcon />}
          >
            新規登録
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <UserSearchForm
          key={JSON.stringify(searchParams)}
          onSearch={handleSearch}
          onReset={handleReset}
          searchParams={searchParams}
        />

        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-2 items-center flex-wrap">
            <SaveSearchConditionButton
              onClick={() => setIsSaveConditionDialogOpen(true)}
              disabled={!hasSearchConditions}
            />
            <Button
              variant="outline"
              onClick={() => setIsSearchConditionListDialogOpen(true)}
              icon={<BookmarkIcon />}
            >
              検索条件一覧
            </Button>
          </div>
          <div className="flex gap-2">
            <CsvExportButton onExport={handleCsvExport} variant="outline">
              CSV出力
            </CsvExportButton>
          </div>
        </div>

        <FormError error={error} />

        <UserTable
          users={users}
          total={total}
          page={page}
          onPageChange={setPage}
          onRowClick={setEditingUserId}
        />
      </div>

      <UserManagementDialogs
        isBulkDialogOpen={isBulkDialogOpen}
        onCloseBulkDialog={() => setIsBulkDialogOpen(false)}
        onDownloadTemplateCSV={handleDownloadTemplateCSV}
        onDownloadEditTemplateCSV={handleDownloadEditTemplateCSV}
        onUploadCSV={handleUploadCSV}
        onBulkError={setError}
        isCreateDialogOpen={isCreateDialogOpen}
        onCloseCreateDialog={() => setIsCreateDialogOpen(false)}
        onCreateUserSuccess={handleCreateUserSuccess}
        editingUserId={editingUserId}
        onCloseEditDialog={() => setEditingUserId(null)}
        onEditUserSuccess={handleEditUserSuccess}
        isSaveConditionDialogOpen={isSaveConditionDialogOpen}
        onCloseSaveConditionDialog={() => setIsSaveConditionDialogOpen(false)}
        onSaveCondition={saveCondition}
        isSearchConditionListDialogOpen={isSearchConditionListDialogOpen}
        onCloseSearchConditionListDialog={() =>
          setIsSearchConditionListDialogOpen(false)
        }
        filteredConditions={filteredConditions}
        onDeleteCondition={deleteCondition}
        onSearchConditions={searchConditions}
        onApplyCondition={applyCondition}
        isSearchConditionLoading={isSearchConditionLoading}
      />
    </PageContainer>
  );
};
