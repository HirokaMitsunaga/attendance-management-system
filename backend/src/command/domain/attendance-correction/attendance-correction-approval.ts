import type { CorrectionPunchEvent } from './attendance-correction-event';
import type { AttendanceRecord } from '../attendance-record/attendance-record.entity';
import { PUNCH_TYPE, type PunchType } from '../common/punch/punch-type';

/**
 * 勤怠修正の承認結果（承認済みPunch）を勤怠記録へ反映するドメインロジック。
 *
 * - 集約（AttendanceCorrection / AttendanceRecord）をまたぐ調整を担当する
 * - 永続化や外部I/Oは行わない（UseCaseが担当）
 */
export class AttendanceCorrectionApproval {
  applyApprovedPunchEventsToRecord(params: {
    record: AttendanceRecord;
    approvedPunchEvents: CorrectionPunchEvent[];
  }): void {
    const { record, approvedPunchEvents } = params;

    const handlerMap: Record<PunchType, (occurredAt: Date) => void> = {
      [PUNCH_TYPE.CLOCK_IN]: (occurredAt) => {
        record.clockIn({ occurredAt });
      },
      [PUNCH_TYPE.CLOCK_OUT]: (occurredAt) => {
        record.clockOut({ occurredAt });
      },
      [PUNCH_TYPE.BREAK_START]: (occurredAt) => {
        record.breakStart({ occurredAt });
      },
      [PUNCH_TYPE.BREAK_END]: (occurredAt) => {
        record.breakEnd({ occurredAt });
      },
    };

    for (const punch of approvedPunchEvents) {
      handlerMap[punch.punchType](punch.occurredAt);
    }
  }
}
