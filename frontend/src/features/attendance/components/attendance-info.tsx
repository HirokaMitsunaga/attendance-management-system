import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import {
  ATTENDANCE_STATUS,
  AttendanceStatus,
} from '../types/attendance-status';
import { StatCard } from './stat-card';

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const variants = {
    [ATTENDANCE_STATUS.NOT_STARTED]: 'bg-muted text-muted-foreground',
    [ATTENDANCE_STATUS.WORKING]:
      'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
    [ATTENDANCE_STATUS.FINISHED]:
      'bg-blue-500/15 text-blue-600 border-blue-500/20',
  };
  return (
    <Badge variant="outline" className={`${variants[status]} font-medium`}>
      {status}
    </Badge>
  );
}
// Mock data
const todayStatus: {
  clockIn: string | null;
  clockOut: string | null;
  workingHours: string;
  status: AttendanceStatus;
} = {
  clockIn: '09:02',
  clockOut: '',
  workingHours: '5時間32分',
  status: ATTENDANCE_STATUS.WORKING,
};

export const AttendanceInfo = () => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          今日の勤怠ステータス
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">ステータス</span>
          <StatusBadge status={todayStatus.status} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="出勤時刻"
            value={todayStatus.clockIn}
            placeholder="--:--"
          />
          <StatCard
            label="退勤時刻"
            value={todayStatus.clockOut}
            placeholder=" --:-- "
          />
          <StatCard label="勤務時間" value={todayStatus.workingHours} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            size="lg"
            className="flex-1 gap-2"
            disabled={todayStatus.status !== ATTENDANCE_STATUS.NOT_STARTED}
          >
            <Clock className="h-4 w-4" />
            出勤
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="flex-1 gap-2"
            disabled={todayStatus.status !== ATTENDANCE_STATUS.WORKING}
          >
            <Clock className="h-4 w-4" />
            退勤
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
