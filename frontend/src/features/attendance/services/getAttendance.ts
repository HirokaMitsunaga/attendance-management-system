import { convertTodayPunch } from '@/features/attendance/utils/convertTodayPunch';
import { GetEventResponseDto } from '@/features/attendance/types/get-event-response-dto';
import { TodayStatus } from '@/features/attendance/types/todday-status';

import { fetcher } from '@/lib/fetcher';
import { NOT_STARTED_STATUS } from '../constants/notStartedStatus';

export const getAttendance = async ({
  userId,
  workDate,
}: {
  userId: string;
  workDate: string;
}): Promise<TodayStatus> => {
  try {
    const punch = await fetcher<GetEventResponseDto[]>(
      `/attendance-record?userId=${userId}&workDate=${workDate}`,
    );
    return convertTodayPunch(punch);
  } catch {
    return NOT_STARTED_STATUS;
  }
};
