'use client';

import { Dialog, Button, CancelIcon, TrashIcon } from '@/components/ui';

type DeleteDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  details?: React.ReactNode;
  isSubmitting?: boolean;
  confirmLabel?: string;
};

export const DeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  details,
  isSubmitting = false,
  confirmLabel = '削除',
}: DeleteDialogProps) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch {
      // エラーは呼び出し側でトースト表示済みであればここでは何もしない
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            icon={<CancelIcon />}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            icon={<TrashIcon />}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-gray-700">{message}</p>
        {details && <div className="bg-gray-50 p-4 rounded-lg">{details}</div>}
      </div>
    </Dialog>
  );
};
