import { ATTENDANCE_STATUS, type AttendanceStatus } from '@attendance/shared';

export { ATTENDANCE_STATUS, type AttendanceStatus };

export const ATTENDANCE_STATUS_LABEL: Record<AttendanceStatus, string> = {
  [ATTENDANCE_STATUS.NOT_STARTED]: '未出勤',
  [ATTENDANCE_STATUS.WORKING]: '勤務中',
  [ATTENDANCE_STATUS.BREAKING]: '休憩中',
  [ATTENDANCE_STATUS.FINISHED]: '退勤済',
};
