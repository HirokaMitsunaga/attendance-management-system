import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  clockInEventRequestSchema,
  type ClockInEventRequestDto,
} from 'src/command/request/clockInEventRequest';
import { ClockInAttendanceRecordUseCase } from 'src/command/useCase/attendance-record/clock-in-attendance-record.use-case';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@Controller('attendance-record')
export class AttendanceRecordController {
  constructor(
    private readonly clockInAttendanceRecordUseCase: ClockInAttendanceRecordUseCase,
  ) {}
  @Post('clock-in')
  @HttpCode(200)
  async createClockInEvent(
    @Body(new ZodValidationPipe(clockInEventRequestSchema))
    body: ClockInEventRequestDto,
  ): Promise<void> {
    await this.clockInAttendanceRecordUseCase.execute(body);
  }
}
