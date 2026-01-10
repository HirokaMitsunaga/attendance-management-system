import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  clockInEventRequestSchema,
  type ClockInEventRequestDto,
} from '../../request/clockInEventRequest';
import {
  clockOutEventRequestSchema,
  type ClockOutEventRequestDto,
} from '../../request/clockOutEventRequest';
import { ClockInAttendanceRecordUseCase } from '../../useCase/attendance-record/clock-in-attendance-record.use-case';
import { ClockOutAttendanceRecordUseCase } from '../../useCase/attendance-record/clock-out-attendance-record.use-case';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';

@Controller('attendance-record')
export class AttendanceRecordController {
  constructor(
    private readonly clockInAttendanceRecordUseCase: ClockInAttendanceRecordUseCase,
    private readonly clockOutAttendanceRecordUseCase: ClockOutAttendanceRecordUseCase,
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
}
