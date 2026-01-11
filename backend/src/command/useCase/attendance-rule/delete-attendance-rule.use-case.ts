import { Inject, Injectable } from '@nestjs/common';
import type { IAttendanceRuleRepository } from 'src/command/domain/attendance-rule/attendance-rule-repository.interface';
import { ATTENDANCE_RULE_REPOSITORY } from 'src/command/domain/attendance-rule/attendance-rule.tokens';
import { EntityId } from 'src/command/domain/entity-id.vo';
import { ATTENDANCE_RULE } from 'src/common/constants';
import { NotFoundError } from 'src/common/errors/not-found.error';

export type DeleteAttendanceRuleParams = {
  ruleId: string;
};

@Injectable()
export class DeleteAttendanceRuleUseCase {
  constructor(
    @Inject(ATTENDANCE_RULE_REPOSITORY)
    private readonly attendanceRuleRepository: IAttendanceRuleRepository,
  ) {}

  async execute(params: DeleteAttendanceRuleParams): Promise<void> {
    const ruleId = EntityId.create({ entityId: params.ruleId });

    const existing = await this.attendanceRuleRepository.findById({ ruleId });

    if (!existing) {
      throw new NotFoundError(ATTENDANCE_RULE.NOT_FOUND);
    }

    await this.attendanceRuleRepository.delete({ rule: existing });
  }
}
