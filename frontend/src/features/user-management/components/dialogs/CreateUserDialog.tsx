'use client';

import { Dialog } from '@/components/ui';
import { CreateUserForm } from './CreateUserForm';

type CreateUserDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
};

export const CreateUserDialog = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateUserDialogProps) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="ユーザー新規登録">
      {isOpen && <CreateUserForm onSubmit={onSubmit} onCancel={onClose} />}
    </Dialog>
  );
};
