import { ATTENDANCE_STATUS } from './attendance-status';
import { EntityId } from '../entity-id.vo';
import { PUNCH_TYPE } from './punch/punch-type';
import { PunchVO } from './punch/punch.vo';
import { InvalidWorkRecordStateError } from './work-record.eintity.error';
import { WorkRecord } from './work-record.entity';

describe('WorkRecord Entity', () => {
  const fixedDate = new Date('2024-01-15T00:00:00.000Z');
  const userId = EntityId.generate();
  const workRecordId = EntityId.generate();

  describe('clockIn', () => {
    it('正常系: 出勤打刻が追加される', () => {
      const workRecord = WorkRecord.create({
        userId,
        workDate: fixedDate,
        punches: [],
      });

      const occurredAt = new Date('2024-01-15T01:00:00.000Z');
      workRecord.clockIn({ occurredAt });

      const punches = workRecord.getPunches();
      expect(punches).toHaveLength(1);
      expect(punches[0].getPunchType()).toBe(PUNCH_TYPE.CLOCK_IN);
      expect(punches[0].getOccurredAt()).toEqual(occurredAt);
    });

    it('異常系: 既に出勤済みの場合はエラーを投げる', () => {
      const clockInPunch = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-15T01:00:00.000Z'),
      });

      const workRecord = WorkRecord.reconstruct({
        id: workRecordId,
        userId,
        workDate: fixedDate,
        punches: [clockInPunch],
      });

      expect(() => {
        workRecord.clockIn({
          occurredAt: new Date('2024-01-15T02:00:00.000Z'),
        });
      }).toThrow(InvalidWorkRecordStateError);
    });

    it('異常系: 退勤済みの場合はエラーを投げる', () => {
      const clockInPunch = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-15T01:00:00.000Z'),
      });
      const clockOutPunch = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_OUT,
        occurredAt: new Date('2024-01-15T09:00:00.000Z'),
      });

      const workRecord = WorkRecord.reconstruct({
        id: workRecordId,
        userId,
        workDate: fixedDate,
        punches: [clockInPunch, clockOutPunch],
      });

      expect(() => {
        workRecord.clockIn({
          occurredAt: new Date('2024-01-15T10:00:00.000Z'),
        });
      }).toThrow(InvalidWorkRecordStateError);
    });
  });

  describe('clockOut', () => {
    it('正常系: 退勤打刻が追加される', () => {
      const clockInPunch = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-15T01:00:00.000Z'),
      });

      const workRecord = WorkRecord.reconstruct({
        id: workRecordId,
        userId,
        workDate: fixedDate,
        punches: [clockInPunch],
      });

      const occurredAt = new Date('2024-01-15T09:00:00.000Z');
      workRecord.clockOut({ occurredAt });

      const punches = workRecord.getPunches();
      expect(punches).toHaveLength(2);
      expect(punches[1].getPunchType()).toBe(PUNCH_TYPE.CLOCK_OUT);
      expect(punches[1].getOccurredAt()).toEqual(occurredAt);
    });

    it('異常系: 未出勤の場合はエラーを投げる', () => {
      const workRecord = WorkRecord.create({
        userId,
        workDate: fixedDate,
        punches: [],
      });

      expect(() => {
        workRecord.clockOut({
          occurredAt: new Date('2024-01-15T09:00:00.000Z'),
        });
      }).toThrow(InvalidWorkRecordStateError);

      expect(() => {
        workRecord.clockOut({
          occurredAt: new Date('2024-01-15T09:00:00.000Z'),
        });
      }).toThrow(
        `退勤ができません。現在のステータス: ${ATTENDANCE_STATUS.NOT_STARTED}`,
      );
    });

    it('異常系: 休憩中の場合はエラーを投げる', () => {
      const clockInPunch = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-15T01:00:00.000Z'),
      });
      const breakStartPunch = PunchVO.create({
        punchType: PUNCH_TYPE.BREAK_START,
        occurredAt: new Date('2024-01-15T04:00:00.000Z'),
      });

      const workRecord = WorkRecord.reconstruct({
        id: workRecordId,
        userId,
        workDate: fixedDate,
        punches: [clockInPunch, breakStartPunch],
      });

      expect(() => {
        workRecord.clockOut({
          occurredAt: new Date('2024-01-15T09:00:00.000Z'),
        });
      }).toThrow(InvalidWorkRecordStateError);
    });
  });

  describe('breakStart', () => {
    it('正常系: 休憩開始打刻が追加される', () => {
      const clockInPunch = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-15T01:00:00.000Z'),
      });

      const workRecord = WorkRecord.reconstruct({
        id: workRecordId,
        userId,
        workDate: fixedDate,
        punches: [clockInPunch],
      });

      const occurredAt = new Date('2024-01-15T04:00:00.000Z');
      workRecord.breakStart({ occurredAt });

      const punches = workRecord.getPunches();
      expect(punches).toHaveLength(2);
      expect(punches[1].getPunchType()).toBe(PUNCH_TYPE.BREAK_START);
      expect(punches[1].getOccurredAt()).toEqual(occurredAt);
    });

    it('異常系: 未出勤の場合はエラーを投げる', () => {
      const workRecord = WorkRecord.create({
        userId,
        workDate: fixedDate,
        punches: [],
      });

      expect(() => {
        workRecord.breakStart({
          occurredAt: new Date('2024-01-15T04:00:00.000Z'),
        });
      }).toThrow(InvalidWorkRecordStateError);

      expect(() => {
        workRecord.breakStart({
          occurredAt: new Date('2024-01-15T04:00:00.000Z'),
        });
      }).toThrow(
        `休憩の開始ができません。現在のステータス: ${ATTENDANCE_STATUS.NOT_STARTED}`,
      );
    });
  });

  describe('breakEnd', () => {
    it('正常系: 休憩終了打刻が追加される', () => {
      const clockInPunch = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-15T01:00:00.000Z'),
      });
      const breakStartPunch = PunchVO.create({
        punchType: PUNCH_TYPE.BREAK_START,
        occurredAt: new Date('2024-01-15T04:00:00.000Z'),
      });

      const workRecord = WorkRecord.reconstruct({
        id: workRecordId,
        userId,
        workDate: fixedDate,
        punches: [clockInPunch, breakStartPunch],
      });

      const occurredAt = new Date('2024-01-15T05:00:00.000Z');
      workRecord.breakEnd({ occurredAt });

      const punches = workRecord.getPunches();
      expect(punches).toHaveLength(3);
      expect(punches[2].getPunchType()).toBe(PUNCH_TYPE.BREAK_END);
      expect(punches[2].getOccurredAt()).toEqual(occurredAt);
    });

    it('異常系: 勤務中の場合はエラーを投げる', () => {
      const clockInPunch = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-15T01:00:00.000Z'),
      });

      const workRecord = WorkRecord.reconstruct({
        id: workRecordId,
        userId,
        workDate: fixedDate,
        punches: [clockInPunch],
      });

      expect(() => {
        workRecord.breakEnd({
          occurredAt: new Date('2024-01-15T05:00:00.000Z'),
        });
      }).toThrow(InvalidWorkRecordStateError);

      expect(() => {
        workRecord.breakEnd({
          occurredAt: new Date('2024-01-15T05:00:00.000Z'),
        });
      }).toThrow(
        `休憩の終了ができません。現在のステータス: ${ATTENDANCE_STATUS.WORKING}`,
      );
    });
  });

  describe('日付フィルタリング', () => {
    it('異なる日付の打刻は状態判定に影響しない', () => {
      const previousDayClockIn = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-14T00:00:00.000Z'),
      });
      const previousDayClockOut = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_OUT,
        occurredAt: new Date('2024-01-14T12:00:00.000Z'),
      });

      const workRecord = WorkRecord.reconstruct({
        id: workRecordId,
        userId,
        workDate: fixedDate, // 2024-01-15
        punches: [previousDayClockIn, previousDayClockOut],
      });

      // 前日の打刻は無視され、未出勤として扱われる（出勤可能）
      workRecord.clockIn({ occurredAt: new Date('2024-01-15T01:00:00.000Z') });
      expect(workRecord.getPunches()).toHaveLength(3);

      // 退勤できない状態ではエラーになるはず（確認用）
      const workRecord2 = WorkRecord.reconstruct({
        id: workRecordId,
        userId,
        workDate: fixedDate,
        punches: [previousDayClockIn, previousDayClockOut],
      });
      expect(() => {
        workRecord2.clockOut({
          occurredAt: new Date('2024-01-15T09:00:00.000Z'),
        });
      }).toThrow(InvalidWorkRecordStateError);
    });

    it('当日の打刻のみが状態判定に使用される', () => {
      const previousDayClockIn = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-14T00:00:00.000Z'),
      });
      const todayClockIn = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-15T01:00:00.000Z'),
      });

      const workRecord = WorkRecord.reconstruct({
        id: workRecordId,
        userId,
        workDate: fixedDate, // 2024-01-15
        punches: [previousDayClockIn, todayClockIn],
      });

      // 当日の打刻のみが考慮され、勤務中として扱われる（出勤できない）
      expect(() => {
        workRecord.clockIn({
          occurredAt: new Date('2024-01-15T02:00:00.000Z'),
        });
      }).toThrow(InvalidWorkRecordStateError);

      // 退勤は可能
      workRecord.clockOut({ occurredAt: new Date('2024-01-15T09:00:00.000Z') });
      expect(workRecord.getPunches()).toHaveLength(3);
    });
  });

  describe('複数打刻の順序', () => {
    it('最新の打刻が状態判定に使用される', () => {
      const clockInPunch = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-15T01:00:00.000Z'),
      });
      const breakStartPunch = PunchVO.create({
        punchType: PUNCH_TYPE.BREAK_START,
        occurredAt: new Date('2024-01-15T04:00:00.000Z'),
      });
      const breakEndPunch = PunchVO.create({
        punchType: PUNCH_TYPE.BREAK_END,
        occurredAt: new Date('2024-01-15T05:00:00.000Z'),
      });

      const workRecord = WorkRecord.reconstruct({
        id: workRecordId,
        userId,
        workDate: fixedDate,
        punches: [clockInPunch, breakStartPunch, breakEndPunch],
      });

      // 最新は休憩終了（= 勤務中）なので、退勤と休憩開始が可能
      workRecord.clockOut({ occurredAt: new Date('2024-01-15T09:00:00.000Z') });
      expect(workRecord.getPunches()).toHaveLength(4);
    });

    it('打刻が時系列順でなくても正しく判定される', () => {
      const breakEndPunch = PunchVO.create({
        punchType: PUNCH_TYPE.BREAK_END,
        occurredAt: new Date('2024-01-15T05:00:00.000Z'),
      });
      const clockInPunch = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-15T01:00:00.000Z'),
      });
      const breakStartPunch = PunchVO.create({
        punchType: PUNCH_TYPE.BREAK_START,
        occurredAt: new Date('2024-01-15T04:00:00.000Z'),
      });

      const workRecord = WorkRecord.reconstruct({
        id: workRecordId,
        userId,
        workDate: fixedDate,
        punches: [breakEndPunch, clockInPunch, breakStartPunch],
      });

      // 内部でソートされるので、最新は休憩終了（= 勤務中）として正しく判定される
      workRecord.clockOut({ occurredAt: new Date('2024-01-15T09:00:00.000Z') });
      expect(workRecord.getPunches()).toHaveLength(4);
    });
  });

  describe('境界条件', () => {
    it('同日の23:59:59と翌日の00:00:00は別日として扱われる', () => {
      const previousDayClockOut = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_OUT,
        occurredAt: new Date('2024-01-15T14:00:00.000Z'), // UTCで2024-01-15
      });

      const workRecord = WorkRecord.reconstruct({
        id: workRecordId,
        userId,
        workDate: new Date('2024-01-16T00:00:00.000Z'), // UTCで2024-01-16
        punches: [previousDayClockOut],
      });

      // 前日の打刻なので、未出勤として扱われる（出勤可能）
      workRecord.clockIn({ occurredAt: new Date('2024-01-16T01:00:00.000Z') });
      expect(workRecord.getPunches()).toHaveLength(2);
    });

    it('打刻が0件の場合、すべての操作が未出勤状態として扱われる', () => {
      const workRecord = WorkRecord.create({
        userId,
        workDate: fixedDate,
        punches: [],
      });

      expect(() => {
        workRecord.clockOut({
          occurredAt: new Date('2024-01-15T09:00:00.000Z'),
        });
      }).toThrow(InvalidWorkRecordStateError);

      expect(() => {
        workRecord.breakStart({
          occurredAt: new Date('2024-01-15T04:00:00.000Z'),
        });
      }).toThrow(InvalidWorkRecordStateError);

      expect(() => {
        workRecord.breakEnd({
          occurredAt: new Date('2024-01-15T05:00:00.000Z'),
        });
      }).toThrow(InvalidWorkRecordStateError);

      // 出勤のみ成功する
      workRecord.clockIn({ occurredAt: new Date('2024-01-15T01:00:00.000Z') });
      expect(workRecord.getPunches()).toHaveLength(1);
    });
  });

  describe('ワークフロー', () => {
    it('出勤→休憩開始→休憩終了→退勤の一連の流れが正しく動作する', () => {
      const workRecord = WorkRecord.create({
        userId,
        workDate: fixedDate,
        punches: [],
      });

      // 1. 出勤
      workRecord.clockIn({ occurredAt: new Date('2024-01-15T01:00:00.000Z') });
      expect(workRecord.getPunches()).toHaveLength(1);

      // 2. 休憩開始
      workRecord.breakStart({
        occurredAt: new Date('2024-01-15T04:00:00.000Z'),
      });
      expect(workRecord.getPunches()).toHaveLength(2);

      // 3. 休憩終了
      workRecord.breakEnd({ occurredAt: new Date('2024-01-15T05:00:00.000Z') });
      expect(workRecord.getPunches()).toHaveLength(3);

      // 4. 退勤
      workRecord.clockOut({ occurredAt: new Date('2024-01-15T09:00:00.000Z') });
      expect(workRecord.getPunches()).toHaveLength(4);

      // 5. 退勤後はすべての操作が不可（エラーを投げる）
      expect(() => {
        workRecord.clockIn({
          occurredAt: new Date('2024-01-15T10:00:00.000Z'),
        });
      }).toThrow(InvalidWorkRecordStateError);

      expect(() => {
        workRecord.breakStart({
          occurredAt: new Date('2024-01-15T11:00:00.000Z'),
        });
      }).toThrow(InvalidWorkRecordStateError);

      expect(() => {
        workRecord.breakEnd({
          occurredAt: new Date('2024-01-15T12:00:00.000Z'),
        });
      }).toThrow(InvalidWorkRecordStateError);
    });
  });
});
