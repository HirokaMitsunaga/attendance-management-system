import type { LucideIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  useFormContext,
  useFormState,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

type InputFieldProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label: string;
  type: 'time' | 'date' | 'text';
  currentValue?: string; // 現在の値（「未打刻」や実際の時刻）を表示する場合
  icon: LucideIcon;
  className?: string;
};

export const InputField = <TFieldValues extends FieldValues>({
  name,
  label,
  type,
  currentValue,
  icon: Icon,
  className,
}: InputFieldProps<TFieldValues>) => {
  const { register, control } = useFormContext<TFieldValues>();
  // FormProviderで提供されたフォームの状態からエラーを取得するため、useFormStateを使う
  // （formState.errorsを直接参照すると変更検知されない場合があるため）
  const { errors } = useFormState({ control });

  const fieldError = errors[name];
  const errorMessage = fieldError?.message as string | undefined;
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </Label>
      <Input id={name} type={type} className={className} {...register(name)} />
      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      {currentValue && (
        <p className="text-sm text-muted-foreground">現在: {currentValue}</p>
      )}
    </div>
  );
};
