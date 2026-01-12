import { VariantBadge } from '@/components/ui/variant-badge';
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_LABEL,
  type AttendanceStatus,
} from '../types/attendance-status';

const attendanceStatusVariants = {
  [ATTENDANCE_STATUS_LABEL[ATTENDANCE_STATUS.NOT_STARTED]]:
    'bg-muted text-muted-foreground',
  [ATTENDANCE_STATUS_LABEL[ATTENDANCE_STATUS.WORKING]]:
    'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
  [ATTENDANCE_STATUS_LABEL[ATTENDANCE_STATUS.BREAKING]]:
    'bg-amber-500/15 text-amber-600 border-amber-500/20',
  [ATTENDANCE_STATUS_LABEL[ATTENDANCE_STATUS.FINISHED]]:
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
      value={ATTENDANCE_STATUS_LABEL[status]}
      variants={attendanceStatusVariants}
      showEmpty={false}
    />
  );
};
