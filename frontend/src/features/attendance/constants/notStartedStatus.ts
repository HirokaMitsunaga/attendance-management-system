import { ATTENDANCE_STATUS } from '../types/attendance-status';
import { NotStartedStatus } from '../types/todday-status';

export const NOT_STARTED_STATUS: NotStartedStatus = {
  clockIn: null,
  clockOut: null,
  workingHours: '--',
  status: ATTENDANCE_STATUS.NOT_STARTED,
};
