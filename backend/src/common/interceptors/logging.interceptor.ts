import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';
import { CustomLoggerService } from '../../config/custom-logger.service';
import { TraceService } from '../services/trace.service';
import { getCurrentDate } from '../utils/date.utils';
import { ulid } from 'ulid';

type RequestWithUser = Request & {
  user?: {
    id?: string;
  };
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: CustomLoggerService,
    private readonly traceService: TraceService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // リクエストID（traceId）を生成してCLSに保存
    const traceId = ulid();
    this.traceService.setTraceId(traceId);

    // ログインユーザー（JWT から抽出）
    // TODO:認証機能を実装したら、JWTから抽出する
    const user = request?.user;
    const userId = user?.id ?? 'anonymous';

    const { method, url, ip } = request;

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        const statusCode = response.statusCode;
        const responseTime = Date.now() - now;

        // ステータスコードに応じてログレベルを変更
        const logLevelMap: Record<
          string,
          { method: 'error' | 'warn' | 'log'; trace?: string }
        > = {
          error: { method: 'error', trace: undefined },
          warn: { method: 'warn' },
          log: { method: 'log' },
        };

        const getLevelFromStatusCode = (code: number): string => {
          if (code >= 500) return 'error';
          if (code >= 400) return 'warn';
          return 'log';
        };

        const level = getLevelFromStatusCode(statusCode);
        const logConfig = logLevelMap[level];

        // LoggingInterceptorのログは特別な形式で直接出力
        // traceIdは既にCLSに保存されているため、CustomLoggerServiceを通すと自動的に付与される
        // ただし、リクエスト情報をフラットに展開するため、直接JSON文字列化
        const requestLog = {
          traceId,
          timestamp: getCurrentDate().toISOString(),
          level: level.toUpperCase(),
          context: 'LoggingInterceptor',
          method,
          url,
          userId,
          statusCode,
          responseTime: `${responseTime}ms`,
          ip,
        };

        const logMessage = JSON.stringify(requestLog);
        if (logConfig.method === 'error') {
          console.error('===== LoggingInterceptor =====');
          console.error(logMessage);
        } else if (logConfig.method === 'warn') {
          console.warn('===== LoggingInterceptor =====');
          console.warn(logMessage);
        } else {
          console.log('===== LoggingInterceptor Request Log =====');
          console.log(logMessage);
        }
      }),
    );
  }
}
