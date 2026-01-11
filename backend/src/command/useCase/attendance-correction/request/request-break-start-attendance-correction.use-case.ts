import { Inject, Injectable } from '@nestjs/common';
import type { IAttendanceCorrectionRepository } from 'src/command/domain/attendance-correction/attendance-correction-repository.interface';
import { AttendanceCorrection } from 'src/command/domain/attendance-correction/attendance-correction.entity';
import { PUNCH_TYPE } from 'src/command/domain/common/punch/punch-type';
import { EntityId } from 'src/command/domain/entity-id.vo';
import { ATTENDANCE_CORRECTION_REPOSITORY } from 'src/command/domain/attendance-correction/attendance-correction.tokens';
import { ATTENDANCE_CORRECTION, ATTENDANCE_RULE } from 'src/common/constants';
import { DomainError } from 'src/common/errors/domain.error';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { getCurrentDate } from 'src/common/utils/date.utils';
import type { IAttendanceRuleRepository } from 'src/command/domain/attendance-rule/attendance-rule-repository.interface';
import { ATTENDANCE_RULE_REPOSITORY } from 'src/command/domain/attendance-rule/attendance-rule.tokens';
import { AttendanceRulePolicy } from 'src/command/domain/attendance-rule-policy/attendance-rule-policy';

export type RequestBreakStartAttendanceCorrectionParams = {
  userId: string;
  workDate: Date;
  reason: string;
  occurredAt: Date;
};

@Injectable()
export class RequestBreakStartAttendanceCorrectionUseCase {
  constructor(
    @Inject(ATTENDANCE_CORRECTION_REPOSITORY)
    private readonly attendanceCorrectionRepository: IAttendanceCorrectionRepository,
    @Inject(ATTENDANCE_RULE_REPOSITORY)
    private readonly attendanceRuleRepository: IAttendanceRuleRepository,
  ) {}

  async execute(
    params: RequestBreakStartAttendanceCorrectionParams,
  ): Promise<void> {
    const userId = EntityId.create({ entityId: params.userId });

    const existing =
      await this.attendanceCorrectionRepository.findByUserIdAndWorkDate({
        userId: userId.getEntityId(),
        workDate: params.workDate,
      });

    if (existing) {
      throw new DomainError(ATTENDANCE_CORRECTION.ALREADY_EXISTS);
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

    const correction = AttendanceCorrection.create({
      userId,
      workDate: params.workDate,
      requestedBy: params.userId,
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
