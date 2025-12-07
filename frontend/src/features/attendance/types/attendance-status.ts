export const ATTENDANCE_STATUS = {
  NOT_STARTED: '未出勤',
  WORKING: '勤務中',
  FINISHED: '退勤済',
} as const;

export type AttendanceStatus =
  (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];
