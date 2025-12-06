import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodSchema) {}

  transform<T>(value: unknown): T {
    try {
      const parsed = this.schema.parse(value) as T;
      return parsed;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'バリデーションエラー',
          error: 'Bad Request',
          details: error.issues,
        });
      }
      throw error;
    }
  }
}
