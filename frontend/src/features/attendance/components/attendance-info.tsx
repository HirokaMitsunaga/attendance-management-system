'use client';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { ATTENDANCE_STATUS } from '../types/attendance-status';
import { StatCard } from './stat-card';
import { AttendanceStatusBadge } from './attendance-status-badge';
import { useTodayAttendance } from '../hooks/useTodayAttendance';
import { useAttendanceActions } from '../hooks/useAttendanceActions';
import { AttendanceInfoCard } from './attendance-info-card';
import { Loading } from '@/components/ui/Loading';

export const AttendanceInfo = () => {
  const { handleClockIn, handleClockOut } = useAttendanceActions();

  const { todayAttendance, isLoading, error } = useTodayAttendance();

  if (error) {
    return (
      <AttendanceInfoCard>
        <p className="text-red-500">本日の勤怠情報の取得に失敗しました。</p>
      </AttendanceInfoCard>
    );
  }

  if (isLoading) {
    return (
      <AttendanceInfoCard>
        <Loading />
      </AttendanceInfoCard>
    );
  }

  if (!todayAttendance) {
    return (
      <AttendanceInfoCard>
        <p className="text-muted-foreground">勤怠データがありません。</p>
      </AttendanceInfoCard>
    );
  }

  return (
    <AttendanceInfoCard>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">ステータス</span>
          <AttendanceStatusBadge status={todayAttendance.status} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="出勤時刻"
            value={todayAttendance.clockIn}
            placeholder="--:--"
          />
          <StatCard
            label="退勤時刻"
            value={todayAttendance.clockOut}
            placeholder=" --:-- "
          />
          <StatCard label="勤務時間" value={todayAttendance.workingHours} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            size="lg"
            className="flex-1 gap-2"
            disabled={todayAttendance.status !== ATTENDANCE_STATUS.NOT_STARTED}
            onClick={handleClockIn}
          >
            <Clock className="h-4 w-4" />
            出勤
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="flex-1 gap-2"
            disabled={todayAttendance.status !== ATTENDANCE_STATUS.WORKING}
            onClick={handleClockOut}
          >
            <Clock className="h-4 w-4" />
            退勤
          </Button>
        </div>
      </CardContent>
    </AttendanceInfoCard>
  );
};
