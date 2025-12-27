import { Label } from '@/components/ui/label';
import {
  useFormContext,
  useFormState,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { Textarea } from '../ui/textarea';

type TextFieldProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder: string;
  rows: number;
  className?: string;
};

export const TextField = <TFieldValues extends FieldValues>({
  name,
  label,
  placeholder,
  rows,
  className,
}: TextFieldProps<TFieldValues>) => {
  const { register, control } = useFormContext<TFieldValues>();
  // FormProviderで提供されたフォームの状態からエラーを取得するため、useFormStateを使う
  // （formState.errorsを直接参照すると変更検知されない場合があるため）
  const { errors } = useFormState({ control });

  const fieldError = errors[name];
  const errorMessage = fieldError?.message as string | undefined;
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex items-center gap-2">
        {label}
      </Label>
      <Textarea
        id={name}
        placeholder={placeholder}
        rows={rows}
        className={className}
        {...register(name)}
      />
      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
    </div>
  );
};
