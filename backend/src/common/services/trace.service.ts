import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TraceService {
  constructor(private readonly cls: ClsService) {}

  get(key: string): string | undefined {
    return this.cls.get(key);
  }

  set(key: string, value: string): void {
    this.cls.set(key, value);
  }

  getTraceId(): string | undefined {
    return this.get('traceId');
  }

  setTraceId(traceId: string): void {
    this.set('traceId', traceId);
  }
}
