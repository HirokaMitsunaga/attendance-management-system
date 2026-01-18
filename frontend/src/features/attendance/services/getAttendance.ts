import { convertTodayPunch } from '@/features/attendance/utils/convertTodayPunch';
import { ATTENDANCE_STATUS } from '@/features/attendance/types/attendance-status';
import { GetEventResponseDto } from '@/features/attendance/types/get-event-response-dto';
import {
  NotStartedStatus,
  TodayStatus,
} from '@/features/attendance/types/todday-status';

import { fetcher } from '@/lib/fetcher';

const NOT_STARTED_STATUS: NotStartedStatus = {
  clockIn: null,
  clockOut: null,
  workingHours: '--',
  status: ATTENDANCE_STATUS.NOT_STARTED,
};

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
