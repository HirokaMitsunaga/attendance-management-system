'use client';

import { useState } from 'react';
import {
  Dialog,
  Button,
  CsvUploadButton,
  CancelIcon,
  DownloadIcon,
} from '@/components/ui';
import { HelpTooltip } from '@/components/form';
import { errorMessages } from '@/constants/error-messages';

type BulkOperationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onDownloadTemplateCSV: () => void;
  onDownloadEditTemplateCSV: () => void;
  onUploadCSV: (file: File, isEdit: boolean) => Promise<void>;
  onError: (error: string) => void;
};

const TOOLTIP_MESSAGE =
  '編集後はCSV形式で保存してアップロードしてください。\nGoogleスプレッドシートで編集したい場合は、ダウンロードしたエクセルファイルをマイドライブにドラッグすることで使用できるようになります。';

export const BulkOperationDialog = ({
  isOpen,
  onClose,
  onDownloadTemplateCSV,
  onDownloadEditTemplateCSV,
  onUploadCSV,
  onError,
}: BulkOperationDialogProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File, isEdit: boolean) => {
    try {
      setIsUploading(true);
      await onUploadCSV(file, isEdit);
      onClose();
    } catch (err) {
      onError(
        err instanceof Error ? err.message : errorMessages.csvUploadFailed,
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="一括処理"
      size="lg"
      footer={
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isUploading}
          icon={<CancelIcon />}
        >
          閉じる
        </Button>
      }
    >
      <div className="space-y-6">

        <div className="space-y-4">
          {/* 一括登録セクション */}
          <div className="p-5 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2 text-lg">
              <span className="text-2xl">📝</span>
              <span>一括登録</span>
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              新しいデータを一括で登録します。テンプレートをダウンロードして、必要項目を入力してください。
            </p>
            <div className="flex gap-3">
              <HelpTooltip message={TOOLTIP_MESSAGE} position="top">
                <Button
                  variant="outline"
                  onClick={onDownloadTemplateCSV}
                  disabled={isUploading}
                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-200 hover:border-blue-400"
                  icon={<DownloadIcon />}
                >
                  登録用テンプレート（Excel）
                </Button>
              </HelpTooltip>
              <CsvUploadButton
                onUpload={(file) => handleUpload(file, false)}
                variant="primary"
                disabled={isUploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isUploading ? 'アップロード中...' : 'CSVファイルを選択'}
              </CsvUploadButton>
            </div>
          </div>

          {/* 一括編集セクション */}
          <div className="p-5 bg-purple-50 rounded-lg border-2 border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2 text-lg">
              <span className="text-2xl">✏️</span>
              <span>一括編集</span>
            </h3>
            <p className="text-sm text-purple-800 mb-4">
              既存のデータを一括で編集します。編集用テンプレートをダウンロードして、修正したい項目を更新してください。
            </p>
            <div className="flex gap-3">
              <HelpTooltip message={TOOLTIP_MESSAGE} position="top">
                <Button
                  variant="outline"
                  onClick={onDownloadEditTemplateCSV}
                  disabled={isUploading}
                  className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-200 hover:border-purple-400"
                  icon={<DownloadIcon />}
                >
                  編集用テンプレート（Excel）
                </Button>
              </HelpTooltip>
              <CsvUploadButton
                onUpload={(file) => handleUpload(file, true)}
                variant="primary"
                disabled={isUploading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
              >
                {isUploading ? 'アップロード中...' : 'CSVファイルを選択'}
              </CsvUploadButton>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
