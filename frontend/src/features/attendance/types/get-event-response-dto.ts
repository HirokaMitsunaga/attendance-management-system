export type GetEventResponseDto = {
  punchType: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END';
  occurredAt: string;
  source: 'NORMAL' | 'CORRECTION';
  createdAt?: string | undefined;
  sourceId?: string | null | undefined;
};
