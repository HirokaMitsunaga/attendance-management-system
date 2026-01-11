import { Inject, Injectable } from '@nestjs/common';
import type { IAttendanceRuleRepository } from 'src/command/domain/attendance-rule/attendance-rule-repository.interface';
import { AttendanceRule } from 'src/command/domain/attendance-rule/attendance-rule.entity';
import type { RuleTargetAction } from 'src/command/domain/attendance-rule/attendance-rule-target-action';
import type { RuleType } from 'src/command/domain/attendance-rule/attendance-rule-type';
import type { RuleSetting } from 'src/command/domain/attendance-rule/attendance-rule-setting';
import { ATTENDANCE_RULE_REPOSITORY } from 'src/command/domain/attendance-rule/attendance-rule.tokens';
import { EntityId } from 'src/command/domain/entity-id.vo';
import { ATTENDANCE_RULE } from 'src/common/constants';
import { NotFoundError } from 'src/common/errors/not-found.error';

export type UpdateAttendanceRuleParams = {
  ruleId: string;
  targets: RuleTargetAction[];
  type: RuleType;
  setting: RuleSetting;
  enabled: boolean;
};

@Injectable()
export class UpdateAttendanceRuleUseCase {
  constructor(
    @Inject(ATTENDANCE_RULE_REPOSITORY)
    private readonly attendanceRuleRepository: IAttendanceRuleRepository,
  ) {}

  async execute(params: UpdateAttendanceRuleParams): Promise<void> {
    const ruleId = EntityId.create({ entityId: params.ruleId });

    const existing = await this.attendanceRuleRepository.findById({ ruleId });

    if (!existing) {
      throw new NotFoundError(ATTENDANCE_RULE.NOT_FOUND);
    }

    const rule = AttendanceRule.reconstruct({
      id: ruleId,
      targets: params.targets,
      type: params.type,
      setting: params.setting,
      enabled: params.enabled,
    });

    await this.attendanceRuleRepository.update({ rule });
  }
}
