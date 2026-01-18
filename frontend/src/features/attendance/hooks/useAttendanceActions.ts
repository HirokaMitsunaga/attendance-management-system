import { useSWRConfig } from 'swr';
import { toast } from 'react-hot-toast';
import { getTodayDateString } from '../utils/getTodayDateString';
import { apiClient } from '@/libs/api-client';

export const useAttendanceActions = () => {
  const { mutate } = useSWRConfig();
  // TODO: 実際のユーザーIDを取得する方法に置き換える
  const userId = '01KERGSFDE735M6VFWVVQCPPZ3'; // 仮のユーザーID
  const workDate = getTodayDateString();

  const handleClockIn = async () => {
    try {
      const occurredAt = new Date().toISOString();
      await apiClient<void>('/attendance-record/clock-in', {
        method: 'POST',
        body: { userId, workDate, occurredAt },
      });
      toast.success('出勤しました');
      // SWRキャッシュを再取得
      await mutate(['/attendance/today', userId, workDate]);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : '出勤処理に失敗しました',
      );
    }
  };

  const handleClockOut = async () => {
    try {
      const occurredAt = new Date().toISOString();
      await apiClient<void>('/attendance-record/clock-out', {
        method: 'POST',
        body: { userId, workDate, occurredAt },
      });
      toast.success('退勤しました');
      // SWRキャッシュを再取得
      await mutate(['/attendance/today', userId, workDate]);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : '退勤処理に失敗しました',
      );
    }
  };

  return {
    handleClockIn,
    handleClockOut,
  };
};
