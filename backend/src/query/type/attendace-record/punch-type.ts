export const PUNCH_TYPE = {
  CLOCK_IN: 'CLOCK_IN',
  CLOCK_OUT: 'CLOCK_OUT',
  BREAK_START: 'BREAK_START',
  BREAK_END: 'BREAK_END',
} as const;
export type PunchType = (typeof PUNCH_TYPE)[keyof typeof PUNCH_TYPE];
