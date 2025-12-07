import { Badge } from './badge';
import { EmptyValue } from './empty-value';

type VariantConfig<T extends string> = Record<T, string>;

type VariantBadgeProps<T extends string> = {
  readonly value: T | null;
  readonly variants: VariantConfig<T>;
  readonly showEmpty?: boolean;
};

export const VariantBadge = <T extends string>({
  value,
  variants,
  showEmpty = true,
}: VariantBadgeProps<T>) => {
  if (!value && showEmpty) return <EmptyValue />;
  if (!value) return null;

  const className = variants[value];

  return (
    <Badge variant="outline" className={`${className} font-medium`}>
      {value}
    </Badge>
  );
};
