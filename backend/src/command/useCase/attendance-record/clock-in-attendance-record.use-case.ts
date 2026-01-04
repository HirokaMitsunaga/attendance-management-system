import { IAttendanceRecordRepository } from 'src/command/domain/attendance-record/attendance-record-repository.interface';
import { AttendanceRecord } from 'src/command/domain/attendance-record/attendance-record.entity';
import { EntityId } from 'src/command/domain/entity-id.vo';

export type ClockInAttendanceRecordParams = {
  userId: string;
  workDate: Date;
  occurredAt: Date;
};
export class ClockInAttendanceRecordUseCase {
  constructor(
    private readonly attendanceRecordRepository: IAttendanceRecordRepository,
  ) {}

  async execute(params: ClockInAttendanceRecordParams): Promise<void> {
    const userId = EntityId.create({ entityId: params.userId });

    //打刻の時に勤怠記録が作成されるが
    const record =
      (await this.attendanceRecordRepository.findByUserIdAndWorkDate({
        userId: userId.getEntityId(),
        workDate: params.workDate,
      })) ??
      AttendanceRecord.create({
        userId,
        workDate: params.workDate,
        punchEvents: [],
      });

    // TODO: 勤怠ルールリポジトリの実装をしたらルールの適用の処理を追加する
    record.clockIn({ occurredAt: params.occurredAt });
    await this.attendanceRecordRepository.save({ record });
  }
}
