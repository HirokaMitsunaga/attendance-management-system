import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomLoggerService } from '../config/custom-logger.service';
import type { MeResponseDto } from './dto/me-response.dto';
import { PrismaUserMapper } from '../users/infrastructure/persistence/prisma-user.mapper';
import { SYSTEM_USER_ID } from '../common/constants/system';

@Injectable()
export class MeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService,
  ) {}

  async getMe(userId: string): Promise<MeResponseDto> {
    // 開発用: 固定ユーザー（system）を返す（ログインしているように見せかける）
    userId = SYSTEM_USER_ID;
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        this.logger.warn(
          `開発用ユーザー（${userId}）が見つかりません`,
          'MeService',
        );
        // フォールバック: 最初のユーザーを取得
        const firstUser = await this.prisma.user.findFirst({
          orderBy: { createdAt: 'asc' },
        });
        if (!firstUser) {
          throw new Error('ユーザーが見つかりません');
        }
        const entity = PrismaUserMapper.toEntity(firstUser);
        return entity.toPrimitives();
      }

      const entity = PrismaUserMapper.toEntity(user);
      return entity.toPrimitives();
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        undefined,
        'MeService',
      );
      throw error;
    }
  }
}
