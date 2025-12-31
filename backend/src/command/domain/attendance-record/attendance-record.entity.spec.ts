import { ATTENDANCE_STATUS } from './attendance-status';
import { EntityId } from '../entity-id.vo';
import { PUNCH_TYPE } from './punch/punch-type';
import { PunchVO } from './punch/punch.vo';
import { InvalidAttendanceRecordStateError } from './attendance-record.error';
import { AttendanceRecord } from './attendance-record.entity';

describe('AttendanceRecord Entity', () => {
  const fixedDate = new Date('2024-01-15T00:00:00.000Z');
  const userId = EntityId.generate();
  const attendanceRecordId = EntityId.generate();

  describe('clockIn', () => {
    it('正常系: 出勤打刻が追加される', () => {
      const attendanceRecord = AttendanceRecord.create({
        userId,
        workDate: fixedDate,
        punches: [],
      });

      const occurredAt = new Date('2024-01-15T01:00:00.000Z');
      attendanceRecord.clockIn({ occurredAt });

      const punches = attendanceRecord.getPunches();
      expect(punches).toHaveLength(1);
      expect(punches[0].getPunchType()).toBe(PUNCH_TYPE.CLOCK_IN);
      expect(punches[0].getOccurredAt()).toEqual(occurredAt);
    });

    it('異常系: 既に出勤済みの場合はエラーを投げる', () => {
      const clockInPunch = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-15T01:00:00.000Z'),
      });

      const attendanceRecord = AttendanceRecord.reconstruct({
        id: attendanceRecordId,
        userId,
        workDate: fixedDate,
        punches: [clockInPunch],
      });

      expect(() => {
        attendanceRecord.clockIn({
          occurredAt: new Date('2024-01-15T02:00:00.000Z'),
        });
      }).toThrow(InvalidAttendanceRecordStateError);
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

      const attendanceRecord = AttendanceRecord.reconstruct({
        id: attendanceRecordId,
        userId,
        workDate: fixedDate,
        punches: [clockInPunch, clockOutPunch],
      });

      expect(() => {
        attendanceRecord.clockIn({
          occurredAt: new Date('2024-01-15T10:00:00.000Z'),
        });
      }).toThrow(InvalidAttendanceRecordStateError);
    });
  });

  describe('clockOut', () => {
    it('正常系: 退勤打刻が追加される', () => {
      const clockInPunch = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-15T01:00:00.000Z'),
      });

      const attendanceRecord = AttendanceRecord.reconstruct({
        id: attendanceRecordId,
        userId,
        workDate: fixedDate,
        punches: [clockInPunch],
      });

      const occurredAt = new Date('2024-01-15T09:00:00.000Z');
      attendanceRecord.clockOut({ occurredAt });

      const punches = attendanceRecord.getPunches();
      expect(punches).toHaveLength(2);
      expect(punches[1].getPunchType()).toBe(PUNCH_TYPE.CLOCK_OUT);
      expect(punches[1].getOccurredAt()).toEqual(occurredAt);
    });

    it('異常系: 未出勤の場合はエラーを投げる', () => {
      const attendanceRecord = AttendanceRecord.create({
        userId,
        workDate: fixedDate,
        punches: [],
      });

      expect(() => {
        attendanceRecord.clockOut({
          occurredAt: new Date('2024-01-15T09:00:00.000Z'),
        });
      }).toThrow(InvalidAttendanceRecordStateError);

      expect(() => {
        attendanceRecord.clockOut({
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

      const attendanceRecord = AttendanceRecord.reconstruct({
        id: attendanceRecordId,
        userId,
        workDate: fixedDate,
        punches: [clockInPunch, breakStartPunch],
      });

      expect(() => {
        attendanceRecord.clockOut({
          occurredAt: new Date('2024-01-15T09:00:00.000Z'),
        });
      }).toThrow(InvalidAttendanceRecordStateError);
    });
  });

  describe('breakStart', () => {
    it('正常系: 休憩開始打刻が追加される', () => {
      const clockInPunch = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-15T01:00:00.000Z'),
      });

      const attendanceRecord = AttendanceRecord.reconstruct({
        id: attendanceRecordId,
        userId,
        workDate: fixedDate,
        punches: [clockInPunch],
      });

      const occurredAt = new Date('2024-01-15T04:00:00.000Z');
      attendanceRecord.breakStart({ occurredAt });

      const punches = attendanceRecord.getPunches();
      expect(punches).toHaveLength(2);
      expect(punches[1].getPunchType()).toBe(PUNCH_TYPE.BREAK_START);
      expect(punches[1].getOccurredAt()).toEqual(occurredAt);
    });

    it('異常系: 未出勤の場合はエラーを投げる', () => {
      const attendanceRecord = AttendanceRecord.create({
        userId,
        workDate: fixedDate,
        punches: [],
      });

      expect(() => {
        attendanceRecord.breakStart({
          occurredAt: new Date('2024-01-15T04:00:00.000Z'),
        });
      }).toThrow(InvalidAttendanceRecordStateError);

      expect(() => {
        attendanceRecord.breakStart({
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

      const attendanceRecord = AttendanceRecord.reconstruct({
        id: attendanceRecordId,
        userId,
        workDate: fixedDate,
        punches: [clockInPunch, breakStartPunch],
      });

      const occurredAt = new Date('2024-01-15T05:00:00.000Z');
      attendanceRecord.breakEnd({ occurredAt });

      const punches = attendanceRecord.getPunches();
      expect(punches).toHaveLength(3);
      expect(punches[2].getPunchType()).toBe(PUNCH_TYPE.BREAK_END);
      expect(punches[2].getOccurredAt()).toEqual(occurredAt);
    });

    it('異常系: 勤務中の場合はエラーを投げる', () => {
      const clockInPunch = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_IN,
        occurredAt: new Date('2024-01-15T01:00:00.000Z'),
      });

      const attendanceRecord = AttendanceRecord.reconstruct({
        id: attendanceRecordId,
        userId,
        workDate: fixedDate,
        punches: [clockInPunch],
      });

      expect(() => {
        attendanceRecord.breakEnd({
          occurredAt: new Date('2024-01-15T05:00:00.000Z'),
        });
      }).toThrow(InvalidAttendanceRecordStateError);

      expect(() => {
        attendanceRecord.breakEnd({
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

      const attendanceRecord = AttendanceRecord.reconstruct({
        id: attendanceRecordId,
        userId,
        workDate: fixedDate, // 2024-01-15
        punches: [previousDayClockIn, previousDayClockOut],
      });

      // 前日の打刻は無視され、未出勤として扱われる（出勤可能）
      attendanceRecord.clockIn({
        occurredAt: new Date('2024-01-15T01:00:00.000Z'),
      });
      expect(attendanceRecord.getPunches()).toHaveLength(3);

      // 退勤できない状態ではエラーになるはず（確認用）
      const attendanceRecord2 = AttendanceRecord.reconstruct({
        id: attendanceRecordId,
        userId,
        workDate: fixedDate,
        punches: [previousDayClockIn, previousDayClockOut],
      });
      expect(() => {
        attendanceRecord2.clockOut({
          occurredAt: new Date('2024-01-15T09:00:00.000Z'),
        });
      }).toThrow(InvalidAttendanceRecordStateError);
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

      const attendanceRecord = AttendanceRecord.reconstruct({
        id: attendanceRecordId,
        userId,
        workDate: fixedDate, // 2024-01-15
        punches: [previousDayClockIn, todayClockIn],
      });

      // 当日の打刻のみが考慮され、勤務中として扱われる（出勤できない）
      expect(() => {
        attendanceRecord.clockIn({
          occurredAt: new Date('2024-01-15T02:00:00.000Z'),
        });
      }).toThrow(InvalidAttendanceRecordStateError);

      // 退勤は可能
      attendanceRecord.clockOut({
        occurredAt: new Date('2024-01-15T09:00:00.000Z'),
      });
      expect(attendanceRecord.getPunches()).toHaveLength(3);
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

      const attendanceRecord = AttendanceRecord.reconstruct({
        id: attendanceRecordId,
        userId,
        workDate: fixedDate,
        punches: [clockInPunch, breakStartPunch, breakEndPunch],
      });

      // 最新は休憩終了（= 勤務中）なので、退勤と休憩開始が可能
      attendanceRecord.clockOut({
        occurredAt: new Date('2024-01-15T09:00:00.000Z'),
      });
      expect(attendanceRecord.getPunches()).toHaveLength(4);
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

      const attendanceRecord = AttendanceRecord.reconstruct({
        id: attendanceRecordId,
        userId,
        workDate: fixedDate,
        punches: [breakEndPunch, clockInPunch, breakStartPunch],
      });

      // 内部でソートされるので、最新は休憩終了（= 勤務中）として正しく判定される
      attendanceRecord.clockOut({
        occurredAt: new Date('2024-01-15T09:00:00.000Z'),
      });
      expect(attendanceRecord.getPunches()).toHaveLength(4);
    });
  });

  describe('境界条件', () => {
    it('同日の23:59:59と翌日の00:00:00は別日として扱われる', () => {
      const previousDayClockOut = PunchVO.create({
        punchType: PUNCH_TYPE.CLOCK_OUT,
        occurredAt: new Date('2024-01-15T14:00:00.000Z'), // UTCで2024-01-15
      });

      const attendanceRecord = AttendanceRecord.reconstruct({
        id: attendanceRecordId,
        userId,
        workDate: new Date('2024-01-16T00:00:00.000Z'), // UTCで2024-01-16
        punches: [previousDayClockOut],
      });

      // 前日の打刻なので、未出勤として扱われる（出勤可能）
      attendanceRecord.clockIn({
        occurredAt: new Date('2024-01-16T01:00:00.000Z'),
      });
      expect(attendanceRecord.getPunches()).toHaveLength(2);
    });

    it('打刻が0件の場合、すべての操作が未出勤状態として扱われる', () => {
      const attendanceRecord = AttendanceRecord.create({
        userId,
        workDate: fixedDate,
        punches: [],
      });

      expect(() => {
        attendanceRecord.clockOut({
          occurredAt: new Date('2024-01-15T09:00:00.000Z'),
        });
      }).toThrow(InvalidAttendanceRecordStateError);

      expect(() => {
        attendanceRecord.breakStart({
          occurredAt: new Date('2024-01-15T04:00:00.000Z'),
        });
      }).toThrow(InvalidAttendanceRecordStateError);

      expect(() => {
        attendanceRecord.breakEnd({
          occurredAt: new Date('2024-01-15T05:00:00.000Z'),
        });
      }).toThrow(InvalidAttendanceRecordStateError);

      // 出勤のみ成功する
      attendanceRecord.clockIn({
        occurredAt: new Date('2024-01-15T01:00:00.000Z'),
      });
      expect(attendanceRecord.getPunches()).toHaveLength(1);
    });
  });

  describe('ワークフロー', () => {
    it('出勤→休憩開始→休憩終了→退勤の一連の流れが正しく動作する', () => {
      const attendanceRecord = AttendanceRecord.create({
        userId,
        workDate: fixedDate,
        punches: [],
      });

      // 1. 出勤
      attendanceRecord.clockIn({
        occurredAt: new Date('2024-01-15T01:00:00.000Z'),
      });
      expect(attendanceRecord.getPunches()).toHaveLength(1);

      // 2. 休憩開始
      attendanceRecord.breakStart({
        occurredAt: new Date('2024-01-15T04:00:00.000Z'),
      });
      expect(attendanceRecord.getPunches()).toHaveLength(2);

      // 3. 休憩終了
      attendanceRecord.breakEnd({
        occurredAt: new Date('2024-01-15T05:00:00.000Z'),
      });
      expect(attendanceRecord.getPunches()).toHaveLength(3);

      // 4. 退勤
      attendanceRecord.clockOut({
        occurredAt: new Date('2024-01-15T09:00:00.000Z'),
      });
      expect(attendanceRecord.getPunches()).toHaveLength(4);

      // 5. 退勤後はすべての操作が不可（エラーを投げる）
      expect(() => {
        attendanceRecord.clockIn({
          occurredAt: new Date('2024-01-15T10:00:00.000Z'),
        });
      }).toThrow(InvalidAttendanceRecordStateError);

      expect(() => {
        attendanceRecord.breakStart({
          occurredAt: new Date('2024-01-15T11:00:00.000Z'),
        });
      }).toThrow(InvalidAttendanceRecordStateError);

      expect(() => {
        attendanceRecord.breakEnd({
          occurredAt: new Date('2024-01-15T12:00:00.000Z'),
        });
      }).toThrow(InvalidAttendanceRecordStateError);
    });
  });
});
