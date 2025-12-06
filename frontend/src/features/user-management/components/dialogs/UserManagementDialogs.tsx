'use client';

import {
  BulkOperationDialog,
  SaveSearchConditionDialog,
  SearchConditionListDialog,
} from '@/components/features';
import { CreateUserDialog } from './CreateUserDialog';
import { EditUserDialog } from './EditUserDialog';
import type { SearchConditionResponseDto } from '@/types/search-condition';

type UserManagementDialogsProps = {
  isBulkDialogOpen: boolean;
  onCloseBulkDialog: () => void;
  onDownloadTemplateCSV: () => void;
  onDownloadEditTemplateCSV: () => void;
  onUploadCSV: (file: File, isEdit: boolean) => Promise<void>;
  onBulkError: (error: string) => void;

  isCreateDialogOpen: boolean;
  onCloseCreateDialog: () => void;
  onCreateUserSuccess: () => Promise<void>;

  editingUserId: string | null;
  onCloseEditDialog: () => void;
  onEditUserSuccess: () => Promise<void>;

  isSaveConditionDialogOpen: boolean;
  onCloseSaveConditionDialog: () => void;
  onSaveCondition: (name: string) => Promise<void>;

  isSearchConditionListDialogOpen: boolean;
  onCloseSearchConditionListDialog: () => void;
  filteredConditions: SearchConditionResponseDto[];
  onDeleteCondition: (id: string) => Promise<void>;
  onSearchConditions: (searchParams: { name?: string }) => Promise<void>;
  onApplyCondition: (condition: SearchConditionResponseDto) => void;
  isSearchConditionLoading: boolean;
};

export const UserManagementDialogs = ({
  isBulkDialogOpen,
  onCloseBulkDialog,
  onDownloadTemplateCSV,
  onDownloadEditTemplateCSV,
  onUploadCSV,
  onBulkError,

  isCreateDialogOpen,
  onCloseCreateDialog,
  onCreateUserSuccess,

  editingUserId,
  onCloseEditDialog,
  onEditUserSuccess,

  isSaveConditionDialogOpen,
  onCloseSaveConditionDialog,
  onSaveCondition,

  isSearchConditionListDialogOpen,
  onCloseSearchConditionListDialog,
  filteredConditions,
  onDeleteCondition,
  onSearchConditions,
  onApplyCondition,
  isSearchConditionLoading,
}: UserManagementDialogsProps) => {
  return (
    <>
      <BulkOperationDialog
        isOpen={isBulkDialogOpen}
        onClose={onCloseBulkDialog}
        onDownloadTemplateCSV={onDownloadTemplateCSV}
        onDownloadEditTemplateCSV={onDownloadEditTemplateCSV}
        onUploadCSV={onUploadCSV}
        onError={onBulkError}
      />

      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onClose={onCloseCreateDialog}
        onSubmit={onCreateUserSuccess}
      />

      {editingUserId && (
        <EditUserDialog
          isOpen={!!editingUserId}
          userId={editingUserId}
          onClose={onCloseEditDialog}
          onSubmit={onEditUserSuccess}
        />
      )}

      <SaveSearchConditionDialog
        isOpen={isSaveConditionDialogOpen}
        onClose={onCloseSaveConditionDialog}
        onSave={onSaveCondition}
      />

      <SearchConditionListDialog
        isOpen={isSearchConditionListDialogOpen}
        onClose={onCloseSearchConditionListDialog}
        conditions={filteredConditions}
        onDelete={onDeleteCondition}
        onSearch={onSearchConditions}
        onApply={onApplyCondition}
        isLoading={isSearchConditionLoading}
      />
    </>
  );
};
