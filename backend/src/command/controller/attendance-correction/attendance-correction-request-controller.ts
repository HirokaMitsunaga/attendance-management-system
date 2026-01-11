import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  attendanceCorrectionRequestSchema,
  type AttendanceCorrectionRequestDto,
} from '../../request/attendanceCorrectionRequest';
import { RequestBreakEndAttendanceCorrectionUseCase } from '../../useCase/attendance-correction/request/request-break-end-attendance-correction.use-case';
import { RequestBreakStartAttendanceCorrectionUseCase } from '../../useCase/attendance-correction/request/request-break-start-attendance-correction.use-case';
import { RequestClockInAttendanceCorrectionUseCase } from '../../useCase/attendance-correction/request/request-clock-in-attendance-correction.use-case';
import { RequestClockOutAttendanceCorrectionUseCase } from '../../useCase/attendance-correction/request/request-clock-out-attendance-correction.use-case';

@Controller('attendance-correction')
export class AttendanceCorrectionRequestController {
  constructor(
    private readonly requestClockInAttendanceCorrectionUseCase: RequestClockInAttendanceCorrectionUseCase,
    private readonly requestClockOutAttendanceCorrectionUseCase: RequestClockOutAttendanceCorrectionUseCase,
    private readonly requestBreakStartAttendanceCorrectionUseCase: RequestBreakStartAttendanceCorrectionUseCase,
    private readonly requestBreakEndAttendanceCorrectionUseCase: RequestBreakEndAttendanceCorrectionUseCase,
  ) {}

  @Post('request/clock-in')
  @HttpCode(200)
  async requestClockIn(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(attendanceCorrectionRequestSchema))
    body: AttendanceCorrectionRequestDto,
  ): Promise<void> {
    await this.requestClockInAttendanceCorrectionUseCase.execute({
      userId,
      ...body,
    });
  }

  @Post('request/clock-out')
  @HttpCode(200)
  async requestClockOut(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(attendanceCorrectionRequestSchema))
    body: AttendanceCorrectionRequestDto,
  ): Promise<void> {
    await this.requestClockOutAttendanceCorrectionUseCase.execute({
      userId,
      ...body,
    });
  }

  @Post('request/break-start')
  @HttpCode(200)
  async requestBreakStart(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(attendanceCorrectionRequestSchema))
    body: AttendanceCorrectionRequestDto,
  ): Promise<void> {
    await this.requestBreakStartAttendanceCorrectionUseCase.execute({
      userId,
      ...body,
    });
  }

  @Post('request/break-end')
  @HttpCode(200)
  async requestBreakEnd(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(attendanceCorrectionRequestSchema))
    body: AttendanceCorrectionRequestDto,
  ): Promise<void> {
    await this.requestBreakEndAttendanceCorrectionUseCase.execute({
      userId,
      ...body,
    });
  }
}
