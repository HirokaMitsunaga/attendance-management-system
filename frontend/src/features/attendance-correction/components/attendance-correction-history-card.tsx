import { RequestStatus } from '@/features/attendance/types/request-status';
import { RequestStatusBadge } from '@/features/attendance/components/request-status-badge';

type AttendanceCorrectionHistoryCardProps = {
  date: string;
  time: string;
  status: RequestStatus;
  reason: string;
};

export const AttendanceCorrectionHistoryCard = ({
  date,
  time,
  status,
  reason,
}: AttendanceCorrectionHistoryCardProps) => {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between mt-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-foreground">{date}</p>
          <RequestStatusBadge status={status} />
        </div>
        <p className="text-sm text-muted-foreground">{time}</p>
        <p className="text-sm text-muted-foreground">{reason}</p>
      </div>
    </div>
  );
};
