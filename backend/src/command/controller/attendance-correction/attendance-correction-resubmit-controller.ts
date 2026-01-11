import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  attendanceCorrectionRequestSchema,
  type AttendanceCorrectionRequestDto,
} from '../../request/attendanceCorrectionRequest';
import { ResubmitBreakEndAttendanceCorrectionUseCase } from '../../useCase/attendance-correction/resubmit/resubmit-break-end-attendance-correction.use-case';
import { ResubmitBreakStartAttendanceCorrectionUseCase } from '../../useCase/attendance-correction/resubmit/resubmit-break-start-attendance-correction.use-case';
import { ResubmitClockInAttendanceCorrectionUseCase } from '../../useCase/attendance-correction/resubmit/resubmit-clock-in-attendance-correction.use-case';
import { ResubmitClockOutAttendanceCorrectionUseCase } from '../../useCase/attendance-correction/resubmit/resubmit-clock-out-attendance-correction.use-case';

@Controller('attendance-correction')
export class AttendanceCorrectionResubmitController {
  constructor(
    private readonly resubmitClockInAttendanceCorrectionUseCase: ResubmitClockInAttendanceCorrectionUseCase,
    private readonly resubmitClockOutAttendanceCorrectionUseCase: ResubmitClockOutAttendanceCorrectionUseCase,
    private readonly resubmitBreakStartAttendanceCorrectionUseCase: ResubmitBreakStartAttendanceCorrectionUseCase,
    private readonly resubmitBreakEndAttendanceCorrectionUseCase: ResubmitBreakEndAttendanceCorrectionUseCase,
  ) {}

  @Post('resubmit/clock-in')
  @HttpCode(200)
  async resubmitClockIn(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(attendanceCorrectionRequestSchema))
    body: AttendanceCorrectionRequestDto,
  ): Promise<void> {
    await this.resubmitClockInAttendanceCorrectionUseCase.execute({
      userId,
      requestedBy: userId,
      reason: body.reason,
      workDate: body.workDate,
      occurredAt: body.occurredAt,
    });
  }

  @Post('resubmit/clock-out')
  @HttpCode(200)
  async resubmitClockOut(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(attendanceCorrectionRequestSchema))
    body: AttendanceCorrectionRequestDto,
  ): Promise<void> {
    await this.resubmitClockOutAttendanceCorrectionUseCase.execute({
      userId,
      requestedBy: userId,
      reason: body.reason,
      workDate: body.workDate,
      occurredAt: body.occurredAt,
    });
  }

  @Post('resubmit/break-start')
  @HttpCode(200)
  async resubmitBreakStart(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(attendanceCorrectionRequestSchema))
    body: AttendanceCorrectionRequestDto,
  ): Promise<void> {
    await this.resubmitBreakStartAttendanceCorrectionUseCase.execute({
      userId,
      requestedBy: userId,
      reason: body.reason,
      workDate: body.workDate,
      occurredAt: body.occurredAt,
    });
  }

  @Post('resubmit/break-end')
  @HttpCode(200)
  async resubmitBreakEnd(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(attendanceCorrectionRequestSchema))
    body: AttendanceCorrectionRequestDto,
  ): Promise<void> {
    await this.resubmitBreakEndAttendanceCorrectionUseCase.execute({
      userId,
      requestedBy: userId,
      reason: body.reason,
      workDate: body.workDate,
      occurredAt: body.occurredAt,
    });
  }
}
