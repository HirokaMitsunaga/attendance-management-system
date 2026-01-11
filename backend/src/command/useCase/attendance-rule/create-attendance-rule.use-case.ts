import { Inject, Injectable } from '@nestjs/common';
import type { IAttendanceRuleRepository } from 'src/command/domain/attendance-rule/attendance-rule-repository.interface';
import { AttendanceRule } from 'src/command/domain/attendance-rule/attendance-rule.entity';
import type { RuleTargetAction } from 'src/command/domain/attendance-rule/attendance-rule-target-action';
import type { RuleType } from 'src/command/domain/attendance-rule/attendance-rule-type';
import type { RuleSetting } from 'src/command/domain/attendance-rule/attendance-rule-setting';
import { ATTENDANCE_RULE_REPOSITORY } from 'src/command/domain/attendance-rule/attendance-rule.tokens';

export type CreateAttendanceRuleParams = {
  targets: RuleTargetAction[];
  type: RuleType;
  setting: RuleSetting;
  enabled: boolean;
};

@Injectable()
export class CreateAttendanceRuleUseCase {
  constructor(
    @Inject(ATTENDANCE_RULE_REPOSITORY)
    private readonly attendanceRuleRepository: IAttendanceRuleRepository,
  ) {}

  async execute(params: CreateAttendanceRuleParams): Promise<void> {
    const rule = AttendanceRule.create({
      targets: params.targets,
      type: params.type,
      setting: params.setting,
      enabled: params.enabled,
    });

    await this.attendanceRuleRepository.create({ rule });
  }
}
