import { Badge } from './badge';

type EmptyValueProps = {
  readonly children?: React.ReactNode;
  readonly className?: string;
};

export const EmptyValue = ({
  children = '-',
  className = '',
}: EmptyValueProps) => {
  return (
    <Badge
      variant="outline"
      className={`text-muted-foreground border-dashed ${className}`}
    >
      {children}
    </Badge>
  );
};
