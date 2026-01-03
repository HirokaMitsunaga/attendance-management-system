import { AttendanceRule } from '../attendance-rule/attendance-rule.entity';
import { RULE_TARGET_ACTION } from '../attendance-rule/attendance-rule-target-action';
import { RULE_TYPE } from '../attendance-rule/attendance-rule-type';
import { AttendanceRulePolicy } from './attendance-rule-policy';
import { DomainError } from '../../../common/errors/domain.error';

describe('AttendanceRulePolicy', () => {
  const policy = new AttendanceRulePolicy();

  describe('ensureCanClockIn', () => {
    it('正常系: 10:30ちょうどは出勤可能', () => {
      const rule = AttendanceRule.create({
        enabled: true,
        targets: [RULE_TARGET_ACTION.CLOCK_IN],
        type: RULE_TYPE.ALLOW_CLOCK_IN_ONLY_BEFORE_TIME,
        setting: {
          type: RULE_TYPE.ALLOW_CLOCK_IN_ONLY_BEFORE_TIME,
          latestClockInTime: '10:30',
        },
      });

      expect(() => {
        policy.ensureCanClockIn({
          rules: [rule],
          occurredAt: new Date(2024, 0, 15, 10, 30, 0),
        });
      }).not.toThrow();
    });

    it('異常系: 10:30を超えたら出勤不可', () => {
      const rule = AttendanceRule.create({
        enabled: true,
        targets: [RULE_TARGET_ACTION.CLOCK_IN],
        type: RULE_TYPE.ALLOW_CLOCK_IN_ONLY_BEFORE_TIME,
        setting: {
          type: RULE_TYPE.ALLOW_CLOCK_IN_ONLY_BEFORE_TIME,
          latestClockInTime: '10:30',
        },
      });

      expect(() => {
        policy.ensureCanClockIn({
          rules: [rule],
          occurredAt: new Date(2024, 0, 15, 10, 31, 0),
        });
      }).toThrow(DomainError);
    });

    it('正常系: 対象外のルール（target違い）は無視される', () => {
      const rule = AttendanceRule.create({
        enabled: true,
        targets: [RULE_TARGET_ACTION.CLOCK_OUT],
        type: RULE_TYPE.ALLOW_CLOCK_IN_ONLY_BEFORE_TIME,
        setting: {
          type: RULE_TYPE.ALLOW_CLOCK_IN_ONLY_BEFORE_TIME,
          latestClockInTime: '10:30',
        },
      });

      expect(() => {
        policy.ensureCanClockIn({
          rules: [rule],
          occurredAt: new Date(2024, 0, 15, 10, 31, 0),
        });
      }).not.toThrow();
    });

    it('正常系: 無効化されたルールは無視される', () => {
      const rule = AttendanceRule.create({
        enabled: false,
        targets: [RULE_TARGET_ACTION.CLOCK_IN],
        type: RULE_TYPE.ALLOW_CLOCK_IN_ONLY_BEFORE_TIME,
        setting: {
          type: RULE_TYPE.ALLOW_CLOCK_IN_ONLY_BEFORE_TIME,
          latestClockInTime: '10:30',
        },
      });

      expect(() => {
        policy.ensureCanClockIn({
          rules: [rule],
          occurredAt: new Date(2024, 0, 15, 10, 31, 0),
        });
      }).not.toThrow();
    });
  });

  describe('ensureCanClockOut', () => {
    it('正常系: 17:00ちょうどは退勤可能', () => {
      const rule = AttendanceRule.create({
        enabled: true,
        targets: [RULE_TARGET_ACTION.CLOCK_OUT],
        type: RULE_TYPE.ALLOW_CLOCK_OUT_ONLY_AFTER_TIME,
        setting: {
          type: RULE_TYPE.ALLOW_CLOCK_OUT_ONLY_AFTER_TIME,
          earliestClockOutTime: '17:00',
        },
      });

      expect(() => {
        policy.ensureCanClockOut({
          rules: [rule],
          occurredAt: new Date(2024, 0, 15, 17, 0, 0),
        });
      }).not.toThrow();
    });

    it('異常系: 17:00未満は退勤不可', () => {
      const rule = AttendanceRule.create({
        enabled: true,
        targets: [RULE_TARGET_ACTION.CLOCK_OUT],
        type: RULE_TYPE.ALLOW_CLOCK_OUT_ONLY_AFTER_TIME,
        setting: {
          type: RULE_TYPE.ALLOW_CLOCK_OUT_ONLY_AFTER_TIME,
          earliestClockOutTime: '17:00',
        },
      });

      expect(() => {
        policy.ensureCanClockOut({
          rules: [rule],
          occurredAt: new Date(2024, 0, 15, 16, 59, 0),
        });
      }).toThrow(DomainError);
    });

    it('正常系: 対象外のルール（target違い）は無視される', () => {
      const rule = AttendanceRule.create({
        enabled: true,
        targets: [RULE_TARGET_ACTION.CLOCK_IN],
        type: RULE_TYPE.ALLOW_CLOCK_OUT_ONLY_AFTER_TIME,
        setting: {
          type: RULE_TYPE.ALLOW_CLOCK_OUT_ONLY_AFTER_TIME,
          earliestClockOutTime: '17:00',
        },
      });

      expect(() => {
        policy.ensureCanClockOut({
          rules: [rule],
          occurredAt: new Date(2024, 0, 15, 16, 59, 0),
        });
      }).not.toThrow();
    });
  });
});
