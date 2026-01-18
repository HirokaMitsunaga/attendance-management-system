import { ATTENDANCE_STATUS } from '../types/attendance-status';
import type {
  FinishedStatus,
  NotStartedStatus,
  TodayStatus,
  WorkingStatus,
} from '../types/todday-status';
import type { GetEventResponseDto } from '../types/get-event-response-dto';
import { calcWorkingHours } from '@/utils/calcWorkingHours';
import { extractTimeFromISO } from '@/utils/extractTimeFromISO';

const NOT_STARTED_STATUS: NotStartedStatus = {
  clockIn: null,
  clockOut: null,
  workingHours: '--',
  status: ATTENDANCE_STATUS.NOT_STARTED,
};

export const convertTodayPunch = (
  punch: GetEventResponseDto[],
): TodayStatus => {
  const clockInEvent = punch.find((p) => p.punchType === 'CLOCK_IN');
  const clockOutEvent = punch.find((p) => p.punchType === 'CLOCK_OUT');

  if (clockInEvent && clockOutEvent) {
    const clockIn = extractTimeFromISO(clockInEvent.occurredAt);
    const clockOut = extractTimeFromISO(clockOutEvent.occurredAt);
    const workingHours = calcWorkingHours(clockIn, clockOut);

    const finishedStatus: FinishedStatus = {
      clockIn,
      clockOut,
      workingHours,
      status: ATTENDANCE_STATUS.FINISHED,
    };
    return finishedStatus;
  }

  if (clockInEvent) {
    const clockIn = extractTimeFromISO(clockInEvent.occurredAt);

    const workingStatus: WorkingStatus = {
      clockIn,
      clockOut: null,
      workingHours: '--',
      status: ATTENDANCE_STATUS.WORKING,
    };
    return workingStatus;
  }

  return NOT_STARTED_STATUS;
};
