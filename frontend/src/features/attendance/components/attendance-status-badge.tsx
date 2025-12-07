import { VariantBadge } from '@/components/ui/variant-badge';
import {
  ATTENDANCE_STATUS,
  AttendanceStatus,
} from '../types/attendance-status';

const attendanceStatusVariants = {
  [ATTENDANCE_STATUS.NOT_STARTED]: 'bg-muted text-muted-foreground',
  [ATTENDANCE_STATUS.WORKING]:
    'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
  [ATTENDANCE_STATUS.FINISHED]:
    'bg-blue-500/15 text-blue-600 border-blue-500/20',
} as const;

type AttendanceStatusBadgeProps = {
  readonly status: AttendanceStatus;
};

export const AttendanceStatusBadge = ({
  status,
}: AttendanceStatusBadgeProps) => {
  return (
    <VariantBadge
      value={status}
      variants={attendanceStatusVariants}
      showEmpty={false}
    />
  );
};
