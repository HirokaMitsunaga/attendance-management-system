export const REQUEST_STATUS = {
  PENDING: '申請中',
  APPROVED: '承認',
  REJECTED: '却下',
} as const;

export type RequestStatus =
  | (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS]
  | null;
