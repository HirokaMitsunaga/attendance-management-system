import { z } from 'zod';
import { PUNCH_TYPE } from '../type/attendace-record/punch-type';
import { PUNCH_SOURCE } from '../type/attendace-record/punch-source';

const punchEventResponseSchema = z.object({
  punchType: z.enum([
    PUNCH_TYPE.CLOCK_IN,
    PUNCH_TYPE.CLOCK_OUT,
    PUNCH_TYPE.BREAK_START,
    PUNCH_TYPE.BREAK_END,
  ]),
  occurredAt: z.string().datetime(),
  createdAt: z.string().datetime().optional(),
  source: z.enum([PUNCH_SOURCE.NORMAL, PUNCH_SOURCE.CORRECTION]),
  sourceId: z.string().nullable().optional(),
});

export const getEventResponseSchema = z.array(punchEventResponseSchema);

export type GetEventResponseDto = z.infer<typeof getEventResponseSchema>;
