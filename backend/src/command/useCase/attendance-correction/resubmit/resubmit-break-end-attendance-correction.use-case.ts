import { Injectable } from '@nestjs/common';
import type { IAttendanceCorrectionRepository } from 'src/command/domain/attendance-correction/attendance-correction-repository.interface';
import { PUNCH_TYPE } from 'src/command/domain/common/punch/punch-type';
import { EntityId } from 'src/command/domain/entity-id.vo';
import { ATTENDANCE_CORRECTION } from 'src/common/constants';
import { NotFoundError } from 'src/common/errors/not-found.error';
import {
  getCurrentDate,
  formatDateToISOString,
} from 'src/common/utils/date.utils';

export type ResubmitBreakEndAttendanceCorrectionParams = {
  userId: string;
  workDate: Date;
  requestedBy: string;
  reason: string | null;
  occurredAt: Date;
};

@Injectable()
export class ResubmitBreakEndAttendanceCorrectionUseCase {
  constructor(
    private readonly attendanceCorrectionRepository: IAttendanceCorrectionRepository,
  ) {}

  async execute(
    params: ResubmitBreakEndAttendanceCorrectionParams,
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

    correction.resubmit({
      requestedBy: params.requestedBy,
      requestedAt: getCurrentDate(),
      reason: params.reason,
      punchEvents: [
        {
          punchType: PUNCH_TYPE.BREAK_END,
          occurredAt: params.occurredAt,
        },
      ],
    });

    await this.attendanceCorrectionRepository.save({ correction });
  }
}
