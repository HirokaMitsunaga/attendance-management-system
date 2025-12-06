import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLoggerService } from '../../config/custom-logger.service';
import { SYSTEM_USER_ID } from '../constants/system';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    // 認証ヘッダーがない場合
    if (!authHeader) {
      this.logger.warn(
        `認証ヘッダーがありません - ${req.method} ${req.originalUrl} - IP: ${req.ip}`,
        'AuthMiddleware',
      );
      throw new UnauthorizedException('認証トークンが必要です');
    }

    // Bearerトークンの形式チェック
    if (!authHeader.startsWith('Bearer ')) {
      this.logger.warn(
        `無効な認証ヘッダー形式 - ${req.method} ${req.originalUrl} - IP: ${req.ip}`,
        'AuthMiddleware',
      );
      throw new UnauthorizedException('認証トークンの形式が無効です');
    }

    const token = authHeader.substring(7); // "Bearer " を除去

    // トークンが空の場合
    if (!token) {
      this.logger.warn(
        `トークンが空です - ${req.method} ${req.originalUrl} - IP: ${req.ip}`,
        'AuthMiddleware',
      );
      throw new UnauthorizedException('認証トークンが必要です');
    }

    // TODO: 実際のトークン検証処理を実装
    // 現時点では、トークンが存在することを確認するのみ
    // 将来的にJWT検証などを追加

    // 仮想認証: リクエストヘッダーからユーザーIDを取得、なければ固定値を使用
    const userId = (req.headers['x-user-id'] as string) || SYSTEM_USER_ID;

    // リクエストオブジェクトにユーザー情報を保存
    (req as Request & { user?: { id: string; token: string } }).user = {
      id: userId,
      token,
    };

    next();
  }
}
