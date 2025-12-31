export const ATTENDANCE_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  WORKING: 'WORKING',
  BREAKING: 'BREAKING',
  FINISHED: 'FINISHED',
} as const;

export type AttendanceStatus =
  (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];
