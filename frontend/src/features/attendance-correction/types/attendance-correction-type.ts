export const ATTENDANCE_CORRECTION_TYPE = {
  CLOCK_IN: { value: 'clock_in', label: '出勤時刻' },
  CLOCK_OUT: { value: 'clock_out', label: '退勤時刻' },
} as const;

export type AttendanceCorrectionType =
  (typeof ATTENDANCE_CORRECTION_TYPE)[keyof typeof ATTENDANCE_CORRECTION_TYPE]['value'];

//型ガード関数
export const isValidCorrectionType = (
  value: string,
): value is AttendanceCorrectionType => {
  return (
    value === ATTENDANCE_CORRECTION_TYPE.CLOCK_IN.value ||
    value === ATTENDANCE_CORRECTION_TYPE.CLOCK_OUT.value
  );
};
