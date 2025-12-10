// useAttendanceActions.ts
import { useSWRConfig } from 'swr';
import { ATTENDANCE_STATUS } from '../types/attendance-status';
import type {
  TodayStatus,
  WorkingStatus,
  FinishedStatus,
} from '../types/todday-status';
import { calcWorkingHours } from '@/utils/calcWorkingHours';

export const useAttendanceActions = () => {
  const { mutate } = useSWRConfig();

  const handleClockIn = async () => {
    console.log('出勤ボタンを押しました');

    const now = new Date();
    const clockInTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    await mutate<TodayStatus>(
      '/attendance/today',
      (): WorkingStatus => {
        return {
          clockIn: clockInTime,
          clockOut: null,
          workingHours: '--',
          status: ATTENDANCE_STATUS.WORKING,
        };
      },
      false,
    );
  };

  const handleClockOut = async () => {
    console.log('退勤ボタンを押しました');

    const now = new Date();
    const clockOutTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    await mutate<TodayStatus>(
      '/attendance/today',
      (currentData: TodayStatus | undefined): FinishedStatus => {
        if (!currentData || currentData.clockIn === null) {
          throw new Error('出勤時刻が記録されていません');
        }
        return {
          clockIn: currentData.clockIn,
          clockOut: clockOutTime,
          workingHours: calcWorkingHours(currentData.clockIn, clockOutTime),
          status: ATTENDANCE_STATUS.FINISHED,
        };
      },
      false,
    );
  };

  return {
    handleClockIn,
    handleClockOut,
  };
};
