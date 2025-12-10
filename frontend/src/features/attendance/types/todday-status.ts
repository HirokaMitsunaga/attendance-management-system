import { ATTENDANCE_STATUS } from './attendance-status';

// 未出勤状態
export type NotStartedStatus = {
  clockIn: null;
  clockOut: null;
  workingHours: string;
  status: typeof ATTENDANCE_STATUS.NOT_STARTED;
};

// 勤務中状態（出勤済み・退勤前）
export type WorkingStatus = {
  clockIn: string;
  clockOut: null;
  workingHours: string;
  status: typeof ATTENDANCE_STATUS.WORKING;
};

// 退勤済み状態
export type FinishedStatus = {
  clockIn: string;
  clockOut: string;
  workingHours: string;
  status: typeof ATTENDANCE_STATUS.FINISHED;
};

// API/SWRではどの状態で帰ってくるかわからないため、ユニオン型で一つにまとめる
export type TodayStatus = NotStartedStatus | WorkingStatus | FinishedStatus;
