import { Inject, Injectable } from '@nestjs/common';
import type { IAttendanceCorrectionRepository } from 'src/command/domain/attendance-correction/attendance-correction-repository.interface';
import { AttendanceCorrection } from 'src/command/domain/attendance-correction/attendance-correction.entity';
import { PUNCH_TYPE } from 'src/command/domain/common/punch/punch-type';
import { EntityId } from 'src/command/domain/entity-id.vo';
import { ATTENDANCE_CORRECTION_REPOSITORY } from 'src/command/domain/attendance-correction/attendance-correction.tokens';
import { ATTENDANCE_CORRECTION } from 'src/common/constants';
import { DomainError } from 'src/common/errors/domain.error';
import { getCurrentDate } from 'src/common/utils/date.utils';

export type RequestClockInAttendanceCorrectionParams = {
  userId: string;
  workDate: Date;
  reason: string;
  occurredAt: Date;
};

@Injectable()
export class RequestClockInAttendanceCorrectionUseCase {
  constructor(
    @Inject(ATTENDANCE_CORRECTION_REPOSITORY)
    private readonly attendanceCorrectionRepository: IAttendanceCorrectionRepository,
  ) {}

  async execute(
    params: RequestClockInAttendanceCorrectionParams,
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

    //TODO:勤怠ルールリポジトリができたら、ルールに則しているのかを確認する処理を加える
    const correction = AttendanceCorrection.create({
      userId,
      workDate: params.workDate,
      requestedBy: params.userId,
      requestedAt: getCurrentDate(),
      reason: params.reason,
      punchEvents: [
        {
          punchType: PUNCH_TYPE.CLOCK_IN,
          occurredAt: params.occurredAt,
        },
      ],
    });

    await this.attendanceCorrectionRepository.save({ correction });
  }
}
