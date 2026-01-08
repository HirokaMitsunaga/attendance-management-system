import { AttendanceCorrectionApproval } from './attendance-correction-approval';
import type { CorrectionPunchEvent } from './attendance-correction-event';
import { AttendanceRecord } from '../attendance-record/attendance-record.entity';
import { EntityId } from '../entity-id.vo';
import { PUNCH_TYPE } from '../common/punch/punch-type';
import { InvalidAttendanceRecordStateError } from '../attendance-record/attendance-record.error';

describe('AttendanceCorrectionApproval', () => {
  const approval = new AttendanceCorrectionApproval();
  const workDate = new Date('2024-01-15T00:00:00.000Z');

  const createRecord = () => {
    return AttendanceRecord.create({
      userId: EntityId.generate(),
      workDate,
      punchEvents: [],
    });
  };

  it('正常系: 承認済みPunch(CLOCK_IN)を勤怠記録へ反映できる', () => {
    const record = createRecord();

    const approvedPunchEvents: CorrectionPunchEvent[] = [
      {
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-15T09:00:00.000Z'),
      },
    ];

    approval.applyApprovedPunchEventsToRecord({ record, approvedPunchEvents });

    const punchTypes = record.getPunchEvents().map((p) => p.getPunchType());
    expect(punchTypes).toEqual([PUNCH_TYPE.CLOCK_IN]);
  });

  it('正常系: 複数の承認済みPunchを順に勤怠記録へ反映できる', () => {
    const record = createRecord();

    const approvedPunchEvents: CorrectionPunchEvent[] = [
      {
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-15T09:00:00.000Z'),
      },
      {
        punchType: PUNCH_TYPE.BREAK_START,
        occurredAt: new Date('2024-01-15T12:00:00.000Z'),
      },
      {
        punchType: PUNCH_TYPE.BREAK_END,
        occurredAt: new Date('2024-01-15T13:00:00.000Z'),
      },
      {
        punchType: PUNCH_TYPE.CLOCK_OUT,
        occurredAt: new Date('2024-01-15T18:00:00.000Z'),
      },
    ];

    approval.applyApprovedPunchEventsToRecord({ record, approvedPunchEvents });

    const punchTypes = record.getPunchEvents().map((p) => p.getPunchType());
    expect(punchTypes).toEqual([
      PUNCH_TYPE.CLOCK_IN,
      PUNCH_TYPE.BREAK_START,
      PUNCH_TYPE.BREAK_END,
      PUNCH_TYPE.CLOCK_OUT,
    ]);
  });

  it('異常系: 不正な順序のPunchを適用するとAttendanceRecordの例外がそのまま投げられる', () => {
    const record = createRecord();

    const approvedPunchEvents: CorrectionPunchEvent[] = [
      {
        punchType: PUNCH_TYPE.CLOCK_OUT,
        occurredAt: new Date('2024-01-15T18:00:00.000Z'),
      },
    ];

    expect(() => {
      approval.applyApprovedPunchEventsToRecord({
        record,
        approvedPunchEvents,
      });
    }).toThrow(InvalidAttendanceRecordStateError);
  });
});
