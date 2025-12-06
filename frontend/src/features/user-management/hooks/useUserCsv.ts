import { useUserCsvExport } from './useUserCsvExport';
import { useUserCsvTemplate } from './useUserCsvTemplate';
import { useUserCsvUpload } from './useUserCsvUpload';
import type { UserRole, Gender } from '@/types/user';

type UserSearchFormData = {
  id: string;
  search: string;
  role: UserRole | '';
  gender: Gender | '';
};

type UseUserCsvParams = {
  searchParams: UserSearchFormData;
  fetchUsers: () => Promise<void>;
};

export const useUserCsv = ({ searchParams, fetchUsers }: UseUserCsvParams) => {
  const csvExport = useUserCsvExport({ searchParams });
  const csvTemplate = useUserCsvTemplate();
  const csvUpload = useUserCsvUpload({ fetchUsers });

  return {
    ...csvExport,
    ...csvTemplate,
    ...csvUpload,
  };
};
