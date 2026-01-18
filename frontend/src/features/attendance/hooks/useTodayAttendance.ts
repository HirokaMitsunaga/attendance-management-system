'use client';

import useSWR from 'swr';
import type { TodayStatus } from '../types/todday-status';
import { getTodayDateString } from '../utils/getTodayDateString';
import { apiClient } from '@/libs/api-client';
import { GetEventResponseDto } from '../types/get-event-response-dto';
import { convertTodayPunch } from '../utils/convertTodayPunch';

export const useTodayAttendance = () => {
  // TODO: 実際のユーザーIDを取得する方法に置き換える
  const userId = '01KERGSFDE735M6VFWVVQCPPZ3'; // 仮のユーザーID
  const workDate = getTodayDateString();

  const { data, error, isLoading } = useSWR<TodayStatus>(
    ['/attendance/today', userId, workDate],
    async () => {
      const punch = await apiClient<GetEventResponseDto[]>(
        `/attendance-record?userId=${userId}&workDate=${workDate}`,
      );
      return convertTodayPunch(punch);
    },
  );

  return {
    todayAttendance: data,
    isLoading,
    error,
  };
};
