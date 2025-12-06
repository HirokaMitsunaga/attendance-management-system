import { z } from 'zod';
import { INVALID } from '../../common/constants/validation';
import { MAX_PAGE_SIZE } from '../../common/constants/pagination';

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine((val) => val === undefined || (!Number.isNaN(val) && val >= 1), {
      message: INVALID.PAGE,
    }),
  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine(
      (val) =>
        val === undefined ||
        (!Number.isNaN(val) && val >= 1 && val <= MAX_PAGE_SIZE),
      {
        message: `${INVALID.PAGE_SIZE}（最大値: ${MAX_PAGE_SIZE}）`,
      },
    ),
});

export type PaginationQueryDto = z.infer<typeof paginationQuerySchema>;
