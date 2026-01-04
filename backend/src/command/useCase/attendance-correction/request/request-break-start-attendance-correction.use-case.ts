import { Injectable } from '@nestjs/common';
import type { IAttendanceCorrectionRepository } from 'src/command/domain/attendance-correction/attendance-correction-repository.interface';
import { AttendanceCorrection } from 'src/command/domain/attendance-correction/attendance-correction.entity';
import { PUNCH_TYPE } from 'src/command/domain/common/punch/punch-type';
import { EntityId } from 'src/command/domain/entity-id.vo';
import { ATTENDANCE_CORRECTION } from 'src/common/constants';
import { DomainError } from 'src/common/errors/domain.error';
import { getCurrentDate } from 'src/common/utils/date.utils';

export type RequestBreakStartAttendanceCorrectionParams = {
  userId: string;
  workDate: Date;
  reason: string;
  occurredAt: Date;
};

@Injectable()
export class RequestBreakStartAttendanceCorrectionUseCase {
  constructor(
    private readonly attendanceCorrectionRepository: IAttendanceCorrectionRepository,
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
