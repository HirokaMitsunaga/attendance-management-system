export const PUNCH_SOURCE = {
  NORMAL: 'NORMAL',
  CORRECTION: 'CORRECTION',
} as const;
export type PunchSource = (typeof PUNCH_SOURCE)[keyof typeof PUNCH_SOURCE];
