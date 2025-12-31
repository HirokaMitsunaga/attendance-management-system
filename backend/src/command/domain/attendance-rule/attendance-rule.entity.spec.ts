import { DomainError } from '../../../common/errors/domain.error';
import { AttendanceRule } from './attendance-rule.entity';
import { RULE_TARGET_ACTION } from './attendance-rule-target-action';
import { RULE_TYPE } from './attendance-rule-type';

describe('AttendanceRule', () => {
  it('異常系: type と setting.type が一致しない場合は DomainError を投げる', () => {
    expect(() => {
      AttendanceRule.create({
        enabled: true,
        targets: [RULE_TARGET_ACTION.CLOCK_IN],
        type: RULE_TYPE.ALLOW_CLOCK_IN_ONLY_BEFORE_TIME,
        setting: {
          type: RULE_TYPE.ALLOW_CLOCK_OUT_ONLY_AFTER_TIME,
          earliestClockOutTime: '17:00',
        },
      });
    }).toThrow(DomainError);
  });
});
