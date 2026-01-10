import { Injectable, LoggerService } from '@nestjs/common';
import { TraceService } from '../common/services/trace.service';
import { getCurrentDate } from '../common/utils/date.utils';

@Injectable()
export class CustomLoggerService implements LoggerService {
  constructor(private readonly traceService: TraceService) {}

  private isTestEnv(): boolean {
    return (
      process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID != null
    );
  }

  private formatLog(
    level: string,
    message: string,
    context?: string,
    trace?: string,
  ): string {
    const timestamp = getCurrentDate().toISOString();
    const traceId = this.traceService.getTraceId() ?? 'no-trace';

    const log = {
      traceId,
      timestamp,
      level,
      ...(context && { context }),
      message,
      ...(trace && { trace }),
    };

    return JSON.stringify(log);
  }

  log(message: string, context?: string) {
    if (this.isTestEnv()) return;
    console.log(this.formatLog('LOG', message, context));
  }

  error(message: string | Error, trace?: string, context?: string) {
    if (this.isTestEnv()) return;
    let outputMessage = '';
    let outputTrace = trace;

    if (message instanceof Error) {
      // 引数が Error オブジェクトの場合
      outputMessage = message.message;
      // 第2引数(trace)が指定されていなければ、Errorオブジェクトからstackを取得
      if (!outputTrace) {
        outputTrace = message.stack;
      }
    } else {
      // 文字列の場合
      outputMessage = message;
    }

    console.error(this.formatLog('ERROR', outputMessage, context, outputTrace));
  }

  warn(message: string, context?: string) {
    if (this.isTestEnv()) return;
    console.warn(this.formatLog('WARN', message, context));
  }

  debug(message: string, context?: string) {
    if (process.env.NODE_ENV === 'development' && !this.isTestEnv()) {
      console.debug(this.formatLog('DEBUG', message, context));
    }
  }

  verbose(message: string, context?: string) {
    if (process.env.NODE_ENV === 'development' && !this.isTestEnv()) {
      console.log(this.formatLog('VERBOSE', message, context));
    }
  }
}
