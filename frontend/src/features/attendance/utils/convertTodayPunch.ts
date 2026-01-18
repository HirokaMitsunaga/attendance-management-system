import { ATTENDANCE_STATUS } from '../types/attendance-status';
import type {
  FinishedStatus,
  TodayStatus,
  WorkingStatus,
} from '../types/todday-status';
import type { GetEventResponseDto } from '../types/get-event-response-dto';
import { calcWorkingHours } from '@/utils/calcWorkingHours';
import { extractTimeFromISO } from '@/utils/extractTimeFromISO';
import { NOT_STARTED_STATUS } from '../constants/notStartedStatus';

export const convertTodayPunch = (
  punch: GetEventResponseDto[],
): TodayStatus => {
  // バックエンドのlatestWorkStatus()と整合させるため、最新のイベントを取得
  // 配列はoccurredAtの昇順でソートされているため、末尾から検索する
  const clockInEvent = punch
    .slice()
    .reverse()
    .find((p) => p.punchType === 'CLOCK_IN');
  const clockOutEvent = punch
    .slice()
    .reverse()
    .find((p) => p.punchType === 'CLOCK_OUT');

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
