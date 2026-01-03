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

type RequestedEvent = {
  type: typeof ATTENDANCE_CORRECTION_EVENT_TYPE.REQUESTED;
  requestedAt: Date;
  requestedBy: string;
  reason: string | null;
  punchEvents: CorrectionPunchEvent[];
};

type RejectedEvent = {
  type: typeof ATTENDANCE_CORRECTION_EVENT_TYPE.REJECTED;
  rejectedAt: Date;
  rejectedBy: string;
  comment: string | null;
};

type ApprovedEvent = {
  type: typeof ATTENDANCE_CORRECTION_EVENT_TYPE.APPROVED;
  approvedAt: Date;
  approvedBy: string;
  // 承認時点で「何を承認したか」を固定しておく（後から申請内容が変わってもブレない）
  punchEvents: CorrectionPunchEvent[];
};

type CanceledEvent = {
  type: typeof ATTENDANCE_CORRECTION_EVENT_TYPE.CANCELED;
  canceledAt: Date;
  canceledBy: string;
};

export type CorrectionPunchEvent = {
  punchType: PunchType;
  occurredAt: Date;
};

export type AttendanceCorrectionEvent =
  | RequestedEvent
  | RejectedEvent
  | ApprovedEvent
  | CanceledEvent;
