import { fetcher } from '@/lib/fetcher';

export const clockIn = async ({
  userId,
  workDate,
  occurredAt,
}: {
  userId: string;
  workDate: string;
  occurredAt: string;
}): Promise<void> => {
  await fetcher<void>('/attendance-record/clock-in', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      workDate,
      occurredAt,
    }),
  });
};
