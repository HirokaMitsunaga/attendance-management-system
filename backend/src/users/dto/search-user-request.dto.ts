import { z } from 'zod';
import { USER_ROLES, GENDERS } from '../../common/enums';

export const searchUserRequestSchema = z.object({
  id: z.string().optional(),
  search: z.string().optional(),
  role: z.enum(USER_ROLES).optional(),
  gender: z.enum(GENDERS).nullable().optional(),
});

export type SearchUserRequestDto = z.infer<typeof searchUserRequestSchema>;
