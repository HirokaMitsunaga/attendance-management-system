import type { LucideIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type InputFieldProps = {
  id: string;
  label: string;
  type: 'time' | 'date' | 'text';
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  currentValue?: string; // 現在の値（「未打刻」や実際の時刻）を表示する場合
  icon: LucideIcon;
  className?: string;
};

export const InputField = ({
  id,
  label,
  type,
  value,
  onChange,
  required = false,
  currentValue,
  icon: Icon,
  className,
}: InputFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={className}
      />
      {currentValue && (
        <p className="text-sm text-muted-foreground">現在: {currentValue}</p>
      )}
    </div>
  );
};
