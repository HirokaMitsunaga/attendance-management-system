import { IAttendanceRecordRepository } from 'src/command/domain/attendance-record/attendance-record-repository.interface';
import { EntityId } from 'src/command/domain/entity-id.vo';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { formatDateToISOString } from 'src/common/utils/date.utils';

export type ClockOutAttendanceRecordParams = {
  userId: string;
  workDate: Date;
  occurredAt: Date;
};

export class ClockOutAttendanceRecordUseCase {
  constructor(
    private readonly attendanceRecordRepository: IAttendanceRecordRepository,
  ) {}

  async execute(params: ClockOutAttendanceRecordParams): Promise<void> {
    const userId = EntityId.create({ entityId: params.userId });

    const record =
      await this.attendanceRecordRepository.findByUserIdAndWorkDate({
        userId: userId.getEntityId(),
        workDate: params.workDate,
      });

    if (!record) {
      throw new NotFoundError(
        '勤怠',
        `${params.userId}:${formatDateToISOString(params.workDate)}`,
      );
    }
    // TODO: 勤怠ルールリポジトリの実装をしたらルールの適用の処理を追加する
    record.clockOut({ occurredAt: params.occurredAt });
    await this.attendanceRecordRepository.save({ record });
  }
}
