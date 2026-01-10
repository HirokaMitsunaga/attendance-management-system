import { Inject, Injectable } from '@nestjs/common';
import type { IAttendanceRecordRepository } from 'src/command/domain/attendance-record/attendance-record-repository.interface';
import { AttendanceRecord } from 'src/command/domain/attendance-record/attendance-record.entity';
import { EntityId } from 'src/command/domain/entity-id.vo';
import { ATTENDANCE_RECORD_REPOSITORY } from 'src/command/domain/attendance-record/attendance-record.tokens';

export type ClockInAttendanceRecordParams = {
  userId: string;
  workDate: Date;
  occurredAt: Date;
};

@Injectable()
export class ClockInAttendanceRecordUseCase {
  constructor(
    @Inject(ATTENDANCE_RECORD_REPOSITORY)
    private readonly attendanceRecordRepository: IAttendanceRecordRepository,
  ) {}

  async execute(params: ClockInAttendanceRecordParams): Promise<void> {
    const userId = EntityId.create({ entityId: params.userId });

    // 既存の勤怠記録があれば必ず復元して使う。
    // 理由：状態遷移（例: 二重出勤防止）は punchEvents を元に判定されるため、
    // 常に新規作成すると過去イベントを見落としてルールが効かなくなる。
    const record =
      (await this.attendanceRecordRepository.findByUserIdAndWorkDate({
        userId,
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
