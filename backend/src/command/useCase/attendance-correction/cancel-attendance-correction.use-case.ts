import { Inject, Injectable } from '@nestjs/common';
import type { IAttendanceCorrectionRepository } from 'src/command/domain/attendance-correction/attendance-correction-repository.interface';
import { EntityId } from 'src/command/domain/entity-id.vo';
import { ATTENDANCE_CORRECTION_REPOSITORY } from 'src/command/domain/attendance-correction/attendance-correction.tokens';
import { ATTENDANCE_CORRECTION } from 'src/common/constants';
import { NotFoundError } from 'src/common/errors/not-found.error';
import {
  getCurrentDate,
  formatDateToISOString,
} from 'src/common/utils/date.utils';

export type CancelAttendanceCorrectionParams = {
  userId: string;
  workDate: Date;
  canceledBy: string;
};

@Injectable()
export class CancelAttendanceCorrectionUseCase {
  constructor(
    @Inject(ATTENDANCE_CORRECTION_REPOSITORY)
    private readonly attendanceCorrectionRepository: IAttendanceCorrectionRepository,
  ) {}

  async execute(params: CancelAttendanceCorrectionParams): Promise<void> {
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

    correction.cancel({
      canceledBy: params.canceledBy,
      canceledAt: getCurrentDate(),
    });

    await this.attendanceCorrectionRepository.save({ correction });
  }
}
