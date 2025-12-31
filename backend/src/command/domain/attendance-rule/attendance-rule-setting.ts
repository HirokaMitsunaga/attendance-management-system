import { RULE_TYPE } from './attendance-rule-type';

export type RuleSetting =
  | {
      //何時までに出勤打刻をすることができるのかのルール
      type: typeof RULE_TYPE.ALLOW_CLOCK_IN_ONLY_BEFORE_TIME;
      latestClockInTime: string;
    }
  | {
      //何時から退勤打刻をすることができるのかのルール
      type: typeof RULE_TYPE.ALLOW_CLOCK_OUT_ONLY_AFTER_TIME;
      earliestClockOutTime: string;
    };
