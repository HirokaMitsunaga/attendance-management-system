import { useCallback, useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { UserRole } from '@/types/user';

const roleHierarchy: Record<UserRole, number> = {
  user: 1,
  admin: 2,
};

export const useAuth = () => {
  const { user } = useUser();

  const hasRole = useCallback(
    (requiredRole: UserRole): boolean => {
      if (!user) return false;
      return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
    },
    [user],
  );

  const isAdmin = useCallback((): boolean => hasRole('admin'), [hasRole]);
  const isUser = useCallback((): boolean => hasRole('user'), [hasRole]);

  return useMemo(
    () => ({
      user,
      hasRole,
      isAdmin,
      isUser,
    }),
    [user, hasRole, isAdmin, isUser],
  );
};
