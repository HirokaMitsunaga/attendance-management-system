import { VariantBadge } from '@/components/ui/variant-badge';
import { REQUEST_STATUS, RequestStatus } from '../types/request-status';

const requestStatusVariants = {
  [REQUEST_STATUS.PENDING]:
    'bg-amber-500/15 text-amber-600 border-amber-500/20',
  [REQUEST_STATUS.APPROVED]:
    'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
  [REQUEST_STATUS.REJECTED]:
    'bg-destructive/15 text-destructive border-destructive/20',
} as const;

type RequestStatusBadgeProps = {
  readonly status: RequestStatus | null;
};

export const RequestStatusBadge = ({ status }: RequestStatusBadgeProps) => {
  return <VariantBadge value={status} variants={requestStatusVariants} />;
};
