import { Injectable } from '@nestjs/common';
import type { IAttendanceRecordRepository } from 'src/command/domain/attendance-record/attendance-record-repository.interface';
import { EntityId } from 'src/command/domain/entity-id.vo';
import { ATTENDANCE_RECORD } from 'src/common/constants';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { formatDateToISOString } from 'src/common/utils/date.utils';

export type BreakEndAttendanceRecordParams = {
  userId: string;
  workDate: Date;
  occurredAt: Date;
};

@Injectable()
export class BreakEndAttendanceRecordUseCase {
  constructor(
    private readonly attendanceRecordRepository: IAttendanceRecordRepository,
  ) {}

  async execute(params: BreakEndAttendanceRecordParams): Promise<void> {
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

    record.breakEnd({ occurredAt: params.occurredAt });
    await this.attendanceRecordRepository.save({ record });
  }
}
