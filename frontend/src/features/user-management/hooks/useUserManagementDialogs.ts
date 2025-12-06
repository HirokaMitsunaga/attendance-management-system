import { useState, useEffect, useMemo } from 'react';
import { errorMessages } from '@/constants/error-messages';
import { useSearchCondition } from './useSearchCondition';
import type { UserSearchFormData } from './useUserList';

type UseUserManagementDialogsParams = {
  searchParams: UserSearchFormData;
  fetchUsers: () => Promise<void>;
  handleExportCSV: () => Promise<void>;
  setError: (error: string | null) => void;
};

export const useUserManagementDialogs = ({
  searchParams,
  fetchUsers,
  handleExportCSV,
  setError,
}: UseUserManagementDialogsParams) => {
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isSaveConditionDialogOpen, setIsSaveConditionDialogOpen] =
    useState(false);
  const [isSearchConditionListDialogOpen, setIsSearchConditionListDialogOpen] =
    useState(false);

  const {
    filteredConditions,
    isLoading: isSearchConditionLoading,
    fetchSavedConditions,
    searchConditions,
    saveCondition,
    deleteCondition,
    applyCondition,
  } = useSearchCondition();

  useEffect(() => {
    void fetchSavedConditions();
  }, [fetchSavedConditions]);

  const hasSearchConditions = useMemo(
    () =>
      !!searchParams.id ||
      !!searchParams.search ||
      !!searchParams.role ||
      !!searchParams.gender,
    [searchParams],
  );

  const handleCsvExport = async () => {
    try {
      setError(null);
      await handleExportCSV();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : errorMessages.csvExportFailed,
      );
    }
  };

  const handleCreateUserSuccess = async () => {
    setIsCreateDialogOpen(false);
    await fetchUsers();
  };

  const handleEditUserSuccess = async () => {
    setEditingUserId(null);
    await fetchUsers();
  };

  return {
    // Dialog states
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
    // Search condition
    hasSearchConditions,
    filteredConditions,
    isSearchConditionLoading,
    searchConditions,
    saveCondition,
    deleteCondition,
    applyCondition,
    // Handlers
    handleCsvExport,
    handleCreateUserSuccess,
    handleEditUserSuccess,
  };
};
