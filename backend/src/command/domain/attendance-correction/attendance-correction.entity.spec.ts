import { AttendanceCorrection } from './attendance-correction.entity';
import { EntityId } from '../entity-id.vo';
import { PUNCH_TYPE } from '../common/punch/punch-type';
import { ATTENDANCE_CORRECTION_STATUS } from './attendance-correction-status';
import { DomainError } from '../../../common/errors/domain.error';

describe('AttendanceCorrection Entity', () => {
  const userId = EntityId.generate();
  const workDate = new Date('2024-01-15T00:00:00.000Z');

  describe('create', () => {
    it('正常系: 作成時点でステータスが申請中(PENDING)になる', () => {
      const correction = AttendanceCorrection.create({
        userId,
        workDate,
        requestedBy: 'requester-1',
        requestedAt: new Date('2024-01-15T01:00:00.000Z'),
        reason: '電車遅延',
        punches: [
          {
            punchType: PUNCH_TYPE.CLOCK_IN,
            occurredAt: new Date('2024-01-15T01:05:00.000Z'),
          },
        ],
      });

      expect(correction.getStatus()).toBe(ATTENDANCE_CORRECTION_STATUS.PENDING);
      expect(correction.getApprovedPunches()).toEqual([]);
    });
  });

  describe('reconstruct', () => {
    it('異常系: eventsが空の場合はエラーを投げる', () => {
      expect(() => {
        AttendanceCorrection.reconstruct({
          id: EntityId.generate(),
          userId,
          workDate,
          reason: '電車遅延',
          events: [],
        });
      }).toThrow(DomainError);
    });
  });

  describe('approve', () => {
    it('正常系: 申請中(PENDING)の申請を承認でき、承認Punchが取得できる', () => {
      const requestedPunches = [
        {
          punchType: PUNCH_TYPE.CLOCK_IN,
          occurredAt: new Date('2024-01-15T01:05:00.000Z'),
        },
      ];

      const correction = AttendanceCorrection.create({
        userId,
        workDate,
        requestedBy: 'requester-1',
        requestedAt: new Date('2024-01-15T01:00:00.000Z'),
        reason: '電車遅延',
        punches: requestedPunches,
      });

      correction.approve({
        approvedBy: 'approver-1',
        approvedAt: new Date('2024-01-15T02:00:00.000Z'),
      });

      expect(correction.getStatus()).toBe(
        ATTENDANCE_CORRECTION_STATUS.APPROVED,
      );
      expect(correction.getApprovedPunches()).toEqual(requestedPunches);
    });

    it('異常系: 申請中(PENDING)以外は承認できない', () => {
      const correction = AttendanceCorrection.create({
        userId,
        workDate,
        requestedBy: 'requester-1',
        requestedAt: new Date('2024-01-15T01:00:00.000Z'),
        reason: '電車遅延',
        punches: [
          {
            punchType: PUNCH_TYPE.CLOCK_IN,
            occurredAt: new Date('2024-01-15T01:05:00.000Z'),
          },
        ],
      });

      correction.cancel({
        canceledBy: 'requester-1',
        canceledAt: new Date('2024-01-15T01:10:00.000Z'),
      });

      expect(() => {
        correction.approve({
          approvedBy: 'approver-1',
          approvedAt: new Date('2024-01-15T02:00:00.000Z'),
        });
      }).toThrow(DomainError);
    });

    it('正常系: 差し戻し→再申請がある場合、最新の申請内容で承認Punchが確定する', () => {
      const initialPunches = [
        {
          punchType: PUNCH_TYPE.CLOCK_IN,
          occurredAt: new Date('2024-01-15T01:05:00.000Z'),
        },
      ];
      const resubmittedPunches = [
        {
          punchType: PUNCH_TYPE.CLOCK_IN,
          occurredAt: new Date('2024-01-15T01:30:00.000Z'),
        },
      ];

      const correction = AttendanceCorrection.create({
        userId,
        workDate,
        requestedBy: 'requester-1',
        requestedAt: new Date('2024-01-15T01:00:00.000Z'),
        reason: '電車遅延',
        punches: initialPunches,
      });

      correction.reject({
        rejectedBy: 'approver-1',
        rejectedAt: new Date('2024-01-15T01:20:00.000Z'),
        comment: '時刻の根拠が不足',
      });

      correction.resubmit({
        requestedBy: 'requester-1',
        requestedAt: new Date('2024-01-15T01:25:00.000Z'),
        reason: '遅延証明を添付',
        punches: resubmittedPunches,
      });

      correction.approve({
        approvedBy: 'approver-1',
        approvedAt: new Date('2024-01-15T02:00:00.000Z'),
      });

      expect(correction.getStatus()).toBe(
        ATTENDANCE_CORRECTION_STATUS.APPROVED,
      );
      expect(correction.getApprovedPunches()).toEqual(resubmittedPunches);
    });

    it('異常系: 1回の申請で複数の修正(Punch)は指定できない', () => {
      expect(() => {
        AttendanceCorrection.create({
          userId,
          workDate,
          requestedBy: 'requester-1',
          requestedAt: new Date('2024-01-15T01:00:00.000Z'),
          reason: '電車遅延',
          punches: [
            {
              punchType: PUNCH_TYPE.CLOCK_IN,
              occurredAt: new Date('2024-01-15T01:05:00.000Z'),
            },
            {
              punchType: PUNCH_TYPE.CLOCK_OUT,
              occurredAt: new Date('2024-01-15T09:00:00.000Z'),
            },
          ],
        });
      }).toThrow(DomainError);
    });
  });

  describe('reject', () => {
    it('正常系: 申請中(PENDING)の申請を差し戻しできる', () => {
      const correction = AttendanceCorrection.create({
        userId,
        workDate,
        requestedBy: 'requester-1',
        requestedAt: new Date('2024-01-15T01:00:00.000Z'),
        reason: '電車遅延',
        punches: [
          {
            punchType: PUNCH_TYPE.CLOCK_IN,
            occurredAt: new Date('2024-01-15T01:05:00.000Z'),
          },
        ],
      });

      correction.reject({
        rejectedBy: 'approver-1',
        rejectedAt: new Date('2024-01-15T01:20:00.000Z'),
        comment: null,
      });

      expect(correction.getStatus()).toBe(
        ATTENDANCE_CORRECTION_STATUS.REJECTED,
      );
    });

    it('異常系: 申請中(PENDING)以外は差し戻しできない', () => {
      const correction = AttendanceCorrection.create({
        userId,
        workDate,
        requestedBy: 'requester-1',
        requestedAt: new Date('2024-01-15T01:00:00.000Z'),
        reason: '電車遅延',
        punches: [
          {
            punchType: PUNCH_TYPE.CLOCK_IN,
            occurredAt: new Date('2024-01-15T01:05:00.000Z'),
          },
        ],
      });

      correction.approve({
        approvedBy: 'approver-1',
        approvedAt: new Date('2024-01-15T02:00:00.000Z'),
      });

      expect(() => {
        correction.reject({
          rejectedBy: 'approver-1',
          rejectedAt: new Date('2024-01-15T02:10:00.000Z'),
          comment: '差し戻し',
        });
      }).toThrow(DomainError);
    });
  });

  describe('cancel', () => {
    it('正常系: 申請中(PENDING)の申請を取り下げできる', () => {
      const correction = AttendanceCorrection.create({
        userId,
        workDate,
        requestedBy: 'requester-1',
        requestedAt: new Date('2024-01-15T01:00:00.000Z'),
        reason: '電車遅延',
        punches: [
          {
            punchType: PUNCH_TYPE.CLOCK_IN,
            occurredAt: new Date('2024-01-15T01:05:00.000Z'),
          },
        ],
      });

      correction.cancel({
        canceledBy: 'requester-1',
        canceledAt: new Date('2024-01-15T01:10:00.000Z'),
      });

      expect(correction.getStatus()).toBe(
        ATTENDANCE_CORRECTION_STATUS.CANCELED,
      );
      expect(correction.getApprovedPunches()).toEqual([]);
    });
  });

  describe('resubmit', () => {
    it('異常系: 差し戻し(REJECTED)以外は再申請できない', () => {
      const correction = AttendanceCorrection.create({
        userId,
        workDate,
        requestedBy: 'requester-1',
        requestedAt: new Date('2024-01-15T01:00:00.000Z'),
        reason: '電車遅延',
        punches: [
          {
            punchType: PUNCH_TYPE.CLOCK_IN,
            occurredAt: new Date('2024-01-15T01:05:00.000Z'),
          },
        ],
      });

      expect(() => {
        correction.resubmit({
          requestedBy: 'requester-1',
          requestedAt: new Date('2024-01-15T01:10:00.000Z'),
          reason: '追記',
          punches: [
            {
              punchType: PUNCH_TYPE.CLOCK_IN,
              occurredAt: new Date('2024-01-15T01:06:00.000Z'),
            },
          ],
        });
      }).toThrow(DomainError);
    });
  });
});
