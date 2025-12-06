'use client';

import { Dialog, Loading } from '@/components/ui';
import { FormError } from '@/components/form';
import { EditUserForm } from './EditUserForm';
import { useUserDetail } from '../../hooks/useUserDetail';

type EditUserDialogProps = {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  onSubmit: () => Promise<void>;
};

export const EditUserDialog = ({
  isOpen,
  userId,
  onClose,
  onSubmit,
}: EditUserDialogProps) => {
  const { user, isLoading, error, handleSubmit } = useUserDetail({ userId });

  if (isLoading) {
    return (
      <Dialog isOpen={isOpen} onClose={onClose} title="ユーザー編集">
        <Loading />
      </Dialog>
    );
  }

  if (error || !user) {
    return (
      <Dialog isOpen={isOpen} onClose={onClose} title="ユーザー編集">
        <FormError error={error || 'ユーザーが見つかりません'} />
      </Dialog>
    );
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="ユーザー編集">
      <EditUserForm
        user={user}
        onSubmit={handleSubmit}
        onCancel={onClose}
        onSuccess={onSubmit}
      />
    </Dialog>
  );
};
