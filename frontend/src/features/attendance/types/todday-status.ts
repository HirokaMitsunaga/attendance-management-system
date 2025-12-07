import { AttendanceStatus } from './attendance-status';

export type TodayStatus = {
  clockIn: string | null;
  clockOut: string | null;
  workingHours: string;
  status: AttendanceStatus;
};
