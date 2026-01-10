import { Inject, Injectable } from '@nestjs/common';
import type { IAttendanceRecordRepository } from '../../domain/attendance-record/attendance-record-repository.interface';
import { EntityId } from '../../domain/entity-id.vo';
import { ATTENDANCE_RECORD } from '../../../common/constants';
import { NotFoundError } from '../../../common/errors/not-found.error';
import { formatDateToISOString } from '../../../common/utils/date.utils';
import { ATTENDANCE_RECORD_REPOSITORY } from '../../domain/attendance-record/attendance-record.tokens';

export type BreakStartAttendanceRecordParams = {
  userId: string;
  workDate: Date;
  occurredAt: Date;
};

@Injectable()
export class BreakStartAttendanceRecordUseCase {
  constructor(
    @Inject(ATTENDANCE_RECORD_REPOSITORY)
    private readonly attendanceRecordRepository: IAttendanceRecordRepository,
  ) {}

  async execute(params: BreakStartAttendanceRecordParams): Promise<void> {
    const userId = EntityId.create({ entityId: params.userId });

    const record =
      await this.attendanceRecordRepository.findByUserIdAndWorkDate({
        userId,
        workDate: params.workDate,
      });

    if (!record) {
      throw new NotFoundError(
        ATTENDANCE_RECORD.NOT_FOUND,
        `${params.userId}:${formatDateToISOString(params.workDate)}`,
      );
    }

    record.breakStart({ occurredAt: params.occurredAt });
    await this.attendanceRecordRepository.save({ record });
  }
}
