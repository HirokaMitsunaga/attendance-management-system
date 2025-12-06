import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './config/logger.module';
import { UsersModule } from './users/users.module';
import { SearchConditionsModule } from './search-conditions/search-conditions.module';
import { MeModule } from './me/me.module';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    UsersModule,
    SearchConditionsModule,
    MeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  // ロギングは LoggingInterceptor で処理されるため、ミドルウェアは不要
  // 認証ミドルウェアを適用する場合は、NestModule を実装して configure メソッドを追加
  // 例: /api/protected/* のパスに認証を必須とする場合
  // import { NestModule, MiddlewareConsumer } from '@nestjs/common';
  // import { AuthMiddleware } from './common/middleware/auth.middleware';
  // export class AppModule implements NestModule {
  //   configure(consumer: MiddlewareConsumer) {
  //     consumer.apply(AuthMiddleware).forRoutes('api/protected/*');
  //   }
  // }
}
