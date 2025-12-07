import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { ATTENDANCE_STATUS } from '../types/attendance-status';
import { StatCard } from './stat-card';
import { AttendanceStatusBadge } from './attendance-status-badge';
import { useTodayAttendance } from '../hooks/useTodayAttendance';

export const AttendanceInfo = () => {
  const todayStatus = useTodayAttendance();
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
          <AttendanceStatusBadge status={todayStatus.todayAttendance.status} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="出勤時刻"
            value={todayStatus.todayAttendance.clockIn}
            placeholder="--:--"
          />
          <StatCard
            label="退勤時刻"
            value={todayStatus.todayAttendance.clockOut}
            placeholder=" --:-- "
          />
          <StatCard
            label="勤務時間"
            value={todayStatus.todayAttendance.workingHours}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            size="lg"
            className="flex-1 gap-2"
            disabled={
              todayStatus.todayAttendance.status !==
              ATTENDANCE_STATUS.NOT_STARTED
            }
          >
            <Clock className="h-4 w-4" />
            出勤
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="flex-1 gap-2"
            disabled={
              todayStatus.todayAttendance.status !== ATTENDANCE_STATUS.WORKING
            }
          >
            <Clock className="h-4 w-4" />
            退勤
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
