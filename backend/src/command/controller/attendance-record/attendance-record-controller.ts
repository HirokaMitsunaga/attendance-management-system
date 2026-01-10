import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  clockInEventRequestSchema,
  type ClockInEventRequestDto,
} from '../../request/clockInEventRequest';
import {
  clockOutEventRequestSchema,
  type ClockOutEventRequestDto,
} from '../../request/clockOutEventRequest';
import {
  breakStartEventRequestSchema,
  type BreakStartEventRequestDto,
} from '../../request/breakStartEventRequest';
import {
  breakEndEventRequestSchema,
  type BreakEndEventRequestDto,
} from '../../request/breakEndEventRequest';
import { ClockInAttendanceRecordUseCase } from '../../useCase/attendance-record/clock-in-attendance-record.use-case';
import { ClockOutAttendanceRecordUseCase } from '../../useCase/attendance-record/clock-out-attendance-record.use-case';
import { BreakStartAttendanceRecordUseCase } from '../../useCase/attendance-record/break-start-attendance-record.use-case';
import { BreakEndAttendanceRecordUseCase } from '../../useCase/attendance-record/break-end-attendance-record.use-case';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';

@Controller('attendance-record')
export class AttendanceRecordController {
  constructor(
    private readonly clockInAttendanceRecordUseCase: ClockInAttendanceRecordUseCase,
    private readonly clockOutAttendanceRecordUseCase: ClockOutAttendanceRecordUseCase,
    private readonly breakStartAttendanceRecordUseCase: BreakStartAttendanceRecordUseCase,
    private readonly breakEndAttendanceRecordUseCase: BreakEndAttendanceRecordUseCase,
  ) {}

  @Post('clock-in')
  @HttpCode(200)
  async createClockInEvent(
    @Body(new ZodValidationPipe(clockInEventRequestSchema))
    body: ClockInEventRequestDto,
  ): Promise<void> {
    await this.clockInAttendanceRecordUseCase.execute(body);
  }

  @Post('clock-out')
  @HttpCode(200)
  async createClockOutEvent(
    @Body(new ZodValidationPipe(clockOutEventRequestSchema))
    body: ClockOutEventRequestDto,
  ): Promise<void> {
    await this.clockOutAttendanceRecordUseCase.execute(body);
  }

  @Post('break-start')
  @HttpCode(200)
  async createBreakStartEvent(
    @Body(new ZodValidationPipe(breakStartEventRequestSchema))
    body: BreakStartEventRequestDto,
  ): Promise<void> {
    await this.breakStartAttendanceRecordUseCase.execute(body);
  }

  @Post('break-end')
  @HttpCode(200)
  async createBreakEndEvent(
    @Body(new ZodValidationPipe(breakEndEventRequestSchema))
    body: BreakEndEventRequestDto,
  ): Promise<void> {
    await this.breakEndAttendanceRecordUseCase.execute(body);
  }
}
