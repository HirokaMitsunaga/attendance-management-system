import { PunchType } from '../common/punch/punch-type';

/**
 * 勤怠修正イベント（AttendanceCorrectionEvent）は「申請〜承認フローの事実イベント」を表す。
 *
 * - REQUESTED / REJECTED / APPROVED / CANCELED で保持する項目が異なるため、
 *   discriminated union（typeで分岐できる型）として表現する
 * - 承認反映時は、APPROVED に含まれる punchEvents を勤怠（PunchEvent）へ反映する
 */
export const ATTENDANCE_CORRECTION_EVENT_TYPE = {
  REQUESTED: 'REQUESTED',
  REJECTED: 'REJECTED',
  APPROVED: 'APPROVED',
  CANCELED: 'CANCELED',
} as const;

export type EventType =
  (typeof ATTENDANCE_CORRECTION_EVENT_TYPE)[keyof typeof ATTENDANCE_CORRECTION_EVENT_TYPE];

type BaseEvent = {
  /**
   * DB復元したイベントには createdAt が入る（未永続は undefined）
   * => Repository が差分（新規イベント）判定に使う
   */
  createdAt?: Date;
};

export type CorrectionPunchEvent = {
  punchType: PunchType;
  occurredAt: Date;
};

type RequestedEvent = BaseEvent & {
  type: typeof ATTENDANCE_CORRECTION_EVENT_TYPE.REQUESTED;
  requestedAt: Date;
  requestedBy: string;
  reason: string | null;
  punchEvents: CorrectionPunchEvent[];
};

type RejectedEvent = BaseEvent & {
  type: typeof ATTENDANCE_CORRECTION_EVENT_TYPE.REJECTED;
  rejectedAt: Date;
  rejectedBy: string;
  comment: string | null;
};

type ApprovedEvent = BaseEvent & {
  type: typeof ATTENDANCE_CORRECTION_EVENT_TYPE.APPROVED;
  approvedAt: Date;
  approvedBy: string;
  punchEvents: CorrectionPunchEvent[];
};

type CanceledEvent = BaseEvent & {
  type: typeof ATTENDANCE_CORRECTION_EVENT_TYPE.CANCELED;
  canceledAt: Date;
  canceledBy: string;
};

export type AttendanceCorrectionEvent =
  | RequestedEvent
  | RejectedEvent
  | ApprovedEvent
  | CanceledEvent;
