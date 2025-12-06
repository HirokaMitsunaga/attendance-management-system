import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { SYSTEM_USER_ID } from '../constants/system';

type RequestWithUser = Request & {
  user?: {
    id: string;
  };
};

/**
 * 現在のログインユーザーIDを取得するデコレータ
 * 認証ミドルウェアで設定されたユーザーIDを取得します
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    // 仮想認証: リクエストヘッダーからユーザーIDを取得、なければ固定値を使用
    const userId = request.user?.id || request.headers['x-user-id'] || SYSTEM_USER_ID;
    return userId as string;
  },
);
