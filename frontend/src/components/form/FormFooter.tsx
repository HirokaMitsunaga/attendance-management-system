'use client';

import { Button, CancelIcon, SaveIcon, TrashIcon } from '@/components/ui';
import type { ReactNode } from 'react';

type FormFooterProps = {
  onCancel: () => void;
  onSubmit?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  submitIcon?: ReactNode;
  isSubmitting?: boolean;
  disabled?: boolean;
  showCancel?: boolean;
  showSubmit?: boolean;
  submitVariant?: 'primary' | 'danger';
};

/**
 * フォームのフッターコンポーネント
 * キャンセルボタンと送信ボタンを統一されたスタイルで表示
 */
export const FormFooter = ({
  onCancel,
  onSubmit,
  cancelLabel = 'キャンセル',
  submitLabel = '保存',
  submitIcon = <SaveIcon />,
  isSubmitting = false,
  disabled = false,
  showCancel = true,
  showSubmit = true,
  submitVariant = 'primary',
}: FormFooterProps) => {
  return (
    <div className="flex justify-end gap-4">
      {showCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || disabled}
          icon={<CancelIcon />}
        >
          {cancelLabel}
        </Button>
      )}
      {showSubmit && (
        <Button
          type={submitVariant === 'danger' ? 'button' : 'submit'}
          variant={submitVariant}
          disabled={isSubmitting || disabled}
          isLoading={isSubmitting}
          icon={submitIcon}
          onClick={onSubmit}
        >
          {submitLabel}
        </Button>
      )}
    </div>
  );
};

/**
 * 削除確認ダイアログ用のフッターコンポーネント
 * キャンセルボタンと削除ボタンを表示
 */
export const DeleteDialogFooter = ({
  onCancel,
  onConfirm,
  isSubmitting = false,
  deleteLabel = '削除',
}: {
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  deleteLabel?: string;
}) => {
  return (
    <FormFooter
      onCancel={onCancel}
      onSubmit={onConfirm}
      cancelLabel="キャンセル"
      submitLabel={isSubmitting ? '削除中...' : deleteLabel}
      submitIcon={<TrashIcon />}
      isSubmitting={isSubmitting}
      submitVariant="danger"
    />
  );
};
