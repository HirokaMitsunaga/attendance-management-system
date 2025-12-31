export const RULE_TARGET_ACTION = {
  CLOCK_IN: 'CLOCK_IN',
  CLOCK_OUT: 'CLOCK_OUT',
  BREAK_START: 'BREAK_START',
  BREAK_END: 'BREAK_END',
} as const;
export type RuleTargetAction =
  (typeof RULE_TARGET_ACTION)[keyof typeof RULE_TARGET_ACTION];
