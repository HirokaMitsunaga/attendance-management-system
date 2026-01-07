import { Injectable } from '@nestjs/common';
import type { IAttendanceCorrectionRepository } from 'src/command/domain/attendance-correction/attendance-correction-repository.interface';
import { EntityId } from 'src/command/domain/entity-id.vo';
import { ATTENDANCE_RECORD } from 'src/common/constants';
import { NotFoundError } from 'src/common/errors/not-found.error';
import {
  getCurrentDate,
  formatDateToISOString,
} from 'src/common/utils/date.utils';

export type RejectAttendanceCorrectionParams = {
  userId: string;
  workDate: Date;
  rejectedBy: string;
  comment: string | null;
};

@Injectable()
export class RejectAttendanceCorrectionUseCase {
  constructor(
    private readonly attendanceCorrectionRepository: IAttendanceCorrectionRepository,
  ) {}

  async execute(params: RejectAttendanceCorrectionParams): Promise<void> {
    const userId = EntityId.create({ entityId: params.userId });

    const correction =
      await this.attendanceCorrectionRepository.findByUserIdAndWorkDate({
        userId: userId.getEntityId(),
        workDate: params.workDate,
      });

    if (!correction) {
      throw new NotFoundError(
        ATTENDANCE_RECORD.NOT_FOUND,
        `${params.userId}:${formatDateToISOString(params.workDate)}`,
      );
    }

    correction.reject({
      rejectedBy: params.rejectedBy,
      rejectedAt: getCurrentDate(),
      comment: params.comment,
    });

    await this.attendanceCorrectionRepository.save({ correction });
  }
}
