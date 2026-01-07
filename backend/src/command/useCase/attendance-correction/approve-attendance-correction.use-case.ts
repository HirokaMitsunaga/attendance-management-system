import { Injectable } from '@nestjs/common';
import type { IAttendanceCorrectionRepository } from 'src/command/domain/attendance-correction/attendance-correction-repository.interface';
import type { IAttendanceRecordRepository } from 'src/command/domain/attendance-record/attendance-record-repository.interface';
import { AttendanceCorrectionApproval } from 'src/command/domain/attendance-correction/attendance-correction-approval';
import { EntityId } from 'src/command/domain/entity-id.vo';
import { ATTENDANCE_CORRECTION, ATTENDANCE_RECORD } from 'src/common/constants';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { formatDateToISOString } from 'src/common/utils/date.utils';

export type ApproveAttendanceCorrectionParams = {
  userId: string;
  workDate: Date;
  approvedBy: string;
  approveAt: Date;
};

@Injectable()
export class ApproveAttendanceCorrectionUseCase {
  constructor(
    private readonly attendanceCorrectionRepository: IAttendanceCorrectionRepository,
    private readonly attendanceRecordRepository: IAttendanceRecordRepository,
  ) {}

  async execute(params: ApproveAttendanceCorrectionParams): Promise<void> {
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
    correction.approve({
      approvedBy: params.approvedBy,
      approvedAt: params.approveAt,
    });

    //TODO:勤怠集約の追加と同一トランザクションにするのか検討する
    await this.attendanceCorrectionRepository.save({ correction });

    //承認された勤怠の追加
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

    new AttendanceCorrectionApproval().applyApprovedPunchEventsToRecord({
      record,
      approvedPunchEvents: correction.getApprovedPunchEvents(),
    });

    //TODO:修正集約のと同一トランザクションにするのか検討する
    await this.attendanceRecordRepository.save({ record });
  }
}
