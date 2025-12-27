import type { LucideIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useFormContext,
  useFormState,
  Controller,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label: string;
  options: SelectOption[];
  icon?: LucideIcon;
  className?: string;
};

export const SelectField = <TFieldValues extends FieldValues>({
  name,
  label,
  options,
  icon: Icon,
  className,
}: SelectFieldProps<TFieldValues>) => {
  const { control } = useFormContext<TFieldValues>();

  // FormProviderで提供されたフォームの状態からエラーを取得するため、useFormStateを使う
  // （formState.errorsを直接参照すると変更検知されない場合があるため）
  const { errors } = useFormState({ control });

  const fieldError = errors[name];
  const errorMessage = fieldError?.message as string | undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </Label>
      {/*
  Controllerを使用する理由:
  - Radix UIのSelectは value/onValueChange を使用するため、react-hook-formのregisterを直接使えない
  - Controllerがreact-hook-formとカスタムコンポーネントを橋渡しする
  - field.value（現在の値）とfield.onChange（変更関数）を提供
*/}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);
            }}
          >
            <SelectTrigger id={name} className={className}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
    </div>
  );
};
