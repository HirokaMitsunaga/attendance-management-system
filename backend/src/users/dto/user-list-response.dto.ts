import type { UserResponseDto } from './user-response.dto';

export type UserListResponseDto = {
  users: UserResponseDto[];
  total: number;
  page: number;
  pageSize: number;
};
