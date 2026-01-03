export const ATTENDANCE_CORRECTION_STATUS = {
  PENDING: 'PENDING', // 申請中
  REJECTED: 'REJECTED', // 差し戻し
  APPROVED: 'APPROVED', // 承認
  CANCELED: 'CANCELED', // 取り下げ
} as const;

export type AttendanceCorrectionStatus =
  (typeof ATTENDANCE_CORRECTION_STATUS)[keyof typeof ATTENDANCE_CORRECTION_STATUS];
