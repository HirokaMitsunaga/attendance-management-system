'use client';

import useSWR from 'swr';
import type { TodayStatus } from '../types/todday-status';
import { getTodayDateString } from '../lib/getTodayDateString';
import { getAttendance } from '@/features/attendance/services/getAttendance';

export const useTodayAttendance = () => {
  // TODO: 実際のユーザーIDを取得する方法に置き換える
  const userId = '01KERGSFDE735M6VFWVVQCPPZ3'; // 仮のユーザーID
  const workDate = getTodayDateString();

  const { data, error, isLoading } = useSWR<TodayStatus>(
    ['/attendance/today', userId, workDate],
    () => getAttendance({ userId, workDate }),
  );

  return {
    todayAttendance: data,
    isLoading,
    error,
  };
};
