// useTodayAttendance.ts
import useSWR from 'swr';
import { ATTENDANCE_STATUS } from '../types/attendance-status';
import type { TodayStatus, NotStartedStatus } from '../types/todday-status';

// 初期モックデータ（未出勤状態）
const INITIAL_MOCK_DATA: NotStartedStatus = {
  clockIn: null,
  clockOut: null,
  workingHours: '--',
  status: ATTENDANCE_STATUS.NOT_STARTED,
};

// モック用のfetcher（実際のAPIでは不要）
const mockFetcher = async (): Promise<TodayStatus> => {
  // 初回読み込み時の初期データを返す
  return INITIAL_MOCK_DATA;
};

export const useTodayAttendance = () => {
  // SWRを使ってデータを管理（キー: '/attendance/today'）
  const { data, error, isLoading } = useSWR<TodayStatus>(
    '/attendance/today',
    mockFetcher,
  );

  return {
    todayAttendance: data,
    isLoading,
    error,
  };
};
