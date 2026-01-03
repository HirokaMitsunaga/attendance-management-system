import { AttendanceRule } from '../attendance-rule/attendance-rule.entity';
import {
  RULE_TARGET_ACTION,
  RuleTargetAction,
} from '../attendance-rule/attendance-rule-target-action';
import { isAfterOrEqual, isBeforeOrEqual } from '../common/time/time-utils';
import { RULE_TYPE } from '../attendance-rule/attendance-rule-type';
import { DomainError } from '../../../common/errors/domain.error';

export class AttendanceRulePolicy {
  public ensureCanClockIn(params: {
    rules: AttendanceRule[];
    occurredAt: Date;
  }): void {
    const applicable = this.getApplicableRules(
      params.rules,
      RULE_TARGET_ACTION.CLOCK_IN,
    );

    for (const rule of applicable) {
      const setting = rule.getSetting();
      if (setting.type === RULE_TYPE.ALLOW_CLOCK_IN_ONLY_BEFORE_TIME) {
        const { latestClockInTime } = setting;
        if (!isBeforeOrEqual(params.occurredAt, latestClockInTime)) {
          throw new DomainError(`出勤打刻は${latestClockInTime}までです`);
        }
      }
    }
    // ※「二重打刻」などはAttendanceRecord.clockIn側が担保するのでここでは見ない
  }

  public ensureCanClockOut(params: {
    rules: AttendanceRule[];
    occurredAt: Date;
  }): void {
    const applicable = this.getApplicableRules(
      params.rules,
      RULE_TARGET_ACTION.CLOCK_OUT,
    );

    for (const rule of applicable) {
      const setting = rule.getSetting();
      if (setting.type === RULE_TYPE.ALLOW_CLOCK_OUT_ONLY_AFTER_TIME) {
        const { earliestClockOutTime } = setting;
        if (!isAfterOrEqual(params.occurredAt, earliestClockOutTime)) {
          throw new DomainError(
            `退勤打刻は${earliestClockOutTime}以降に可能です`,
          );
        }
      }
    }
  }

  //有効になっているルールかつ、出勤や退勤のどのルールなのかをフィルタリングする
  private getApplicableRules(
    rules: AttendanceRule[],
    action: RuleTargetAction,
  ): AttendanceRule[] {
    return rules.filter(
      (r) => r.isEnabled() && r.getTargets().includes(action),
    );
  }
}
