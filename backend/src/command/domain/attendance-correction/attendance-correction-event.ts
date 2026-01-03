import { PunchType } from '../common/punch/punch-type';

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
  punches: CorrectionPunch[];
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
  punches: CorrectionPunch[];
};

type CanceledEvent = {
  type: typeof ATTENDANCE_CORRECTION_EVENT_TYPE.CANCELED;
  canceledAt: Date;
  canceledBy: string;
};

export type CorrectionPunch = {
  punchType: PunchType;
  occurredAt: Date;
};

export type AttendanceCorrectionEvent =
  | RequestedEvent
  | RejectedEvent
  | ApprovedEvent
  | CanceledEvent;
