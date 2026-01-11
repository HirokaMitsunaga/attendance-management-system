import { Inject, Injectable } from '@nestjs/common';
import type { IAttendanceCorrectionRepository } from 'src/command/domain/attendance-correction/attendance-correction-repository.interface';
import { PUNCH_TYPE } from 'src/command/domain/common/punch/punch-type';
import { EntityId } from 'src/command/domain/entity-id.vo';
import { ATTENDANCE_CORRECTION_REPOSITORY } from 'src/command/domain/attendance-correction/attendance-correction.tokens';
import { ATTENDANCE_CORRECTION, ATTENDANCE_RULE } from 'src/common/constants';
import { NotFoundError } from 'src/common/errors/not-found.error';
import {
  getCurrentDate,
  formatDateToISOString,
} from 'src/common/utils/date.utils';
import type { IAttendanceRuleRepository } from 'src/command/domain/attendance-rule/attendance-rule-repository.interface';
import { ATTENDANCE_RULE_REPOSITORY } from 'src/command/domain/attendance-rule/attendance-rule.tokens';
import { AttendanceRulePolicy } from 'src/command/domain/attendance-rule-policy/attendance-rule-policy';

export type ResubmitBreakStartAttendanceCorrectionParams = {
  userId: string;
  workDate: Date;
  requestedBy: string;
  reason: string | null;
  occurredAt: Date;
};

@Injectable()
export class ResubmitBreakStartAttendanceCorrectionUseCase {
  constructor(
    @Inject(ATTENDANCE_CORRECTION_REPOSITORY)
    private readonly attendanceCorrectionRepository: IAttendanceCorrectionRepository,
    @Inject(ATTENDANCE_RULE_REPOSITORY)
    private readonly attendanceRuleRepository: IAttendanceRuleRepository,
  ) {}

  async execute(
    params: ResubmitBreakStartAttendanceCorrectionParams,
  ): Promise<void> {
    const userId = EntityId.create({ entityId: params.userId });

    const correction =
      await this.attendanceCorrectionRepository.findByUserIdAndWorkDate({
        userId: userId.getEntityId(),
        workDate: params.workDate,
      });

    if (!correction) {
      throw new NotFoundError(
        ATTENDANCE_CORRECTION.NOT_FOUND,
        `${params.userId}:${formatDateToISOString(params.workDate)}`,
      );
    }

    // 勤怠ルールの取得と検証
    const rules = await this.attendanceRuleRepository.findAllEnabled();
    if (rules.length === 0) {
      throw new NotFoundError(ATTENDANCE_RULE.NO_ENABLED_RULES);
    }

    const rulePolicy = new AttendanceRulePolicy();
    rulePolicy.ensureCanBreakStart({
      rules,
      occurredAt: params.occurredAt,
    });

    correction.resubmit({
      requestedBy: params.requestedBy,
      requestedAt: getCurrentDate(),
      reason: params.reason,
      punchEvents: [
        {
          punchType: PUNCH_TYPE.BREAK_START,
          occurredAt: params.occurredAt,
        },
      ],
    });

    await this.attendanceCorrectionRepository.save({ correction });
  }
}
