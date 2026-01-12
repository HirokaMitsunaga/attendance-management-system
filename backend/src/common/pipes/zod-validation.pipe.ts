import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodTypeAny) {}

  transform<T>(value: unknown): T {
    try {
      const parsed = this.schema.parse(value) as T;
      return parsed;
    } catch (error) {
      const issues = getZodIssues(error);
      if (issues) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'バリデーションエラー',
          error: 'Bad Request',
          details: issues,
        });
      }
      throw error;
    }
  }
}

// shared由来などでZodErrorのinstanceof判定が外れる場合があるため、issues/errorsの存在でバリデーションエラーを判定する
//shared側とbackend側で別のZodErrorの場合が起きたうるため、
const getZodIssues = (error: unknown): unknown[] | null => {
  if (typeof error !== 'object' || error === null) return null;

  if (
    'issues' in error &&
    Array.isArray((error as { issues: unknown }).issues)
  ) {
    return (error as { issues: unknown[] }).issues;
  }

  if (
    'errors' in error &&
    Array.isArray((error as { errors: unknown }).errors)
  ) {
    return (error as { errors: unknown[] }).errors;
  }

  return null;
};
