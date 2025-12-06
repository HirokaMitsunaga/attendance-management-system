'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Dialog, Button, CancelIcon, SaveIcon } from '@/components/ui';
import { TextField } from '@/components/form';
import type { UseFormSetError } from 'react-hook-form';

type SaveSearchConditionFormData = {
  name: string;
};

type SaveSearchConditionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    name: string,
    setFormError?: UseFormSetError<SaveSearchConditionFormData>,
  ) => Promise<void>;
};

export const SaveSearchConditionDialog = ({
  isOpen,
  onClose,
  onSave,
}: SaveSearchConditionDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const methods = useForm<SaveSearchConditionFormData>({
    defaultValues: { name: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      await onSave(data.name, methods.setError);
      methods.reset();
      onClose();
    } catch {
      // エラーはonSave内で処理済み
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="検索条件を保存"
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            icon={<CancelIcon />}
          >
            キャンセル
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            icon={<SaveIcon />}
          >
            保存
          </Button>
        </>
      }
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <TextField
            name="name"
            label="名前"
            rules={{ required: '名前は必須です' }}
            placeholder="検索条件の名前を入力"
          />
        </form>
      </FormProvider>
    </Dialog>
  );
};
