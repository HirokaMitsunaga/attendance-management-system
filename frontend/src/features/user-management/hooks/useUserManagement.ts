import { useUserList } from './useUserList';
import { useUserCsv } from './useUserCsv';

export const useUserManagement = () => {
  const userList = useUserList();
  const userCsv = useUserCsv({
    searchParams: userList.searchParams,
    fetchUsers: userList.fetchUsers,
  });

  return {
    ...userList,
    ...userCsv,
  };
};
