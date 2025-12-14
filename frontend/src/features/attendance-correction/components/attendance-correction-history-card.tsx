import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RequestStatus } from '@/features/attendance/types/request-status';
import { RequestStatusBadge } from '@/features/attendance/components/request-status-badge';

type attendanceCorrectionHistoryCardProps = {
  id: string;
  date: string;
  time: string;
  status: RequestStatus;
  reason: string;
};

export default function AttendanceCorrectionHistoryCard({
  id,
  date,
  time,
  status,
  reason,
}: attendanceCorrectionHistoryCardProps) {
  return (
    <Card className="mt-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">申請履歴</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div
            key={id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{date}</p>
                <RequestStatusBadge status={status} />
              </div>
              <p className="text-sm text-muted-foreground">{time}</p>
              <p className="text-sm text-muted-foreground">{reason}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
