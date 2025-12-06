'use client';

import { Button, SaveIcon } from '@/components/ui';

type SaveSearchConditionButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export const SaveSearchConditionButton = ({
  onClick,
  disabled = false,
}: SaveSearchConditionButtonProps) => {
  return (
    <Button variant="outline" onClick={onClick} disabled={disabled}>
      <div className="flex items-center gap-2">
        <SaveIcon />
        <span>検索条件を保存</span>
      </div>
    </Button>
  );
};
