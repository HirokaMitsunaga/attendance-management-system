import { z } from 'zod';
import { USER_ROLES, GENDERS } from '../../common/enums';
import {
  VALIDATION_MESSAGES,
  INVALID,
} from '../../common/constants/validation';

export const updateUserRequestSchema = z.object({
  email: z.string().email(INVALID.EMAIL_FORMAT),
  role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: VALIDATION_MESSAGES.REQUIRED.ROLE }),
  }),
  firstName: z.string().min(1, VALIDATION_MESSAGES.REQUIRED.FIRST_NAME),
  lastName: z.string().min(1, VALIDATION_MESSAGES.REQUIRED.LAST_NAME),
  gender: z.enum(GENDERS).nullable().optional(),
});

export type UpdateUserRequestDto = z.infer<typeof updateUserRequestSchema>;
