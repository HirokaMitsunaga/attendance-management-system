import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Injectable,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApplicationError } from '../errors/application-error';
import { CustomLoggerService } from '../../config/custom-logger.service';
import { VALIDATION_ERROR, INTERNAL_SERVER_ERROR } from '../constants';
import { getCurrentDate } from '../utils/date.utils';

// ZodErrorの型チェック用ヘルパー関数
function isZodError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray((error as { errors: unknown }).errors)
  );
}

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, ip } = request;

    // ============================================
    // ① アプリケーションエラー（ドメインやユースケースでthrowされたもの）
    // ============================================
    if (exception instanceof ApplicationError) {
      const body = exception.toResponse();
      this.logger.warn(
        `ApplicationError: ${body.message} (${body.errorCode}) - ${method} ${url} - IP: ${ip}`,
        'GlobalExceptionFilter',
      );
      response.status(exception.statusCode).json({
        ...body,
        timestamp: getCurrentDate().toISOString(),
      });
      return;
    }

    // ============================================
    // ② HttpException（BadRequestExceptionを含む）
    // ============================================
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // BadRequestExceptionでdetailsがある場合（ZodValidationPipeから）
      if (
        exception instanceof BadRequestException &&
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'details' in exceptionResponse
      ) {
        const details = (exceptionResponse as { details: unknown }).details;
        let message = VALIDATION_ERROR;

        // ZodErrorのissuesを処理
        if (
          Array.isArray(details) &&
          details.every(
            (item) =>
              typeof item === 'object' &&
              item !== null &&
              'message' in item &&
              'path' in item,
          )
        ) {
          const zodIssues = details as Array<{
            message: string;
            path: (string | number)[];
          }>;
          message = zodIssues
            .map((issue) => {
              const path = issue.path.join('.');
              return path ? `${path}: ${issue.message}` : issue.message;
            })
            .join('\n');
        }

        this.logger.warn(
          `ValidationError: ${message} - ${method} ${url} - IP: ${ip}`,
          'GlobalExceptionFilter',
        );
        response.status(400).json({
          statusCode: 400,
          message,
          error: 'Bad Request',
          details,
          timestamp: getCurrentDate().toISOString(),
        });
        return;
      }

      // その他のHttpException
      let message = 'Bad Request';
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        message = String((exceptionResponse as { message: unknown }).message);
      }

      this.logger.warn(
        `HttpException: ${message} - ${method} ${url} - IP: ${ip}`,
        'GlobalExceptionFilter',
      );
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: getCurrentDate().toISOString(),
      });
      return;
    }

    // ============================================
    // ③ Zod バリデーションエラー（直接ZodErrorが投げられた場合）
    // ============================================
    if (isZodError(exception)) {
      const zodError = exception as { errors: Array<{ message: string }> };
      const message = zodError.errors.map((e) => e.message).join(', ');
      this.logger.warn(
        `ValidationError: ${message} - ${method} ${url} - IP: ${ip}`,
        'GlobalExceptionFilter',
      );
      response.status(400).json({
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR',
        message,
        timestamp: getCurrentDate().toISOString(),
      });
      return;
    }

    // ============================================
    // ③ その他（予期しないエラー → 500）
    // ============================================
    const error =
      exception instanceof Error ? exception : new Error(String(exception));

    error.message = `Unexpected Error: ${error.message} - ${method} ${url} - IP: ${ip}`;
    this.logger.error(error, undefined, 'GlobalExceptionFilter');

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: INTERNAL_SERVER_ERROR,
      timestamp: getCurrentDate().toISOString(),
    });
  }
}
